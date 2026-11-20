# File Uploader

A small file-sharing app that I built with Express, EJS, PostgreSQL and Prisma. It lets users sign up, upload files, organize them into folders, download files, and share public files or folders.

I made this project to learn step by step, and it was a little messy at times. This README explains what I built and what I learned, especially about Prisma, the database, sessions and Auth.js.

## What it can do

- Create an account and sign in
- Store passwords as bcrypt hashes, never as plain text
- Upload files with Multer
- Create, rename and delete folders
- Put files inside folders
- Download files
- Make files or folders public
- Open public shared links
- Show how much storage is used

## Technologies

- Node.js and Express
- EJS views and express-ejs-layouts
- Auth.js for Express
- bcrypt/bcryptjs
- Multer for file uploads
- PostgreSQL
- Prisma 7
- Express Validator

Generate a secret if you need one:

```bash
openssl rand -base64 32
```

### 3. Apply the Prisma migrations

```bash
npx prisma migrate dev
```

### 4. Start the app

```bash
node app.js
```

Then open `http://localhost:3000`.

## What I learned

### Prisma is not just a database client

First let me say that using Prisma with Js feels wrong

The Prisma schema is the source of the app's data structure. Models become tables, fields become columns, and relations tell Prisma how tables connect.

This app has:

- `User`: owns folders and files
- `Folder`: belongs to a user and can contain files
- `File`: belongs to a user and a folder

It took me a while to understand that the relation is not only a database concept. I also need to use it when querying: for example, `include: { folder: true }` gives me the related folder in the same query.

For this project I use Prisma 7 with a PostgreSQL adapter. The Prisma client is created in `lib/prisma.js`:

```js
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

The generated client lives in `generated/prisma`. Every change in `prisma/schema.prisma` should be followed by a migration and generation so the code and the database stay in sync.

### Prisma overall

Using Prisma feels so smoth I really love it, idk maybe cause it's my first experience

### Sessions and Auth.js are not the same thing

Auth js took me a lot of time, I wanted to learn it cause it's the most used one, but I ended up strugling cause it still doesnt fully support express, and it's very diffrent that passport js which is simpler.

This app uses Auth.js's JWT session strategy:

```js
session: {
  strategy: 'jwt',
}
```

That means Auth.js stores signed session data in a cookie instead of creating a database session record.

The login flow is:

1. The user enters a username and password.
2. Auth.js calls `authorize()`.
3. Prisma finds the user by username.
4. bcrypt compares the password with the stored hash.
5. If it matches, Auth.js creates a JWT session.
6. The JWT callback adds `id`, `name` and `username` to the token.
7. The session callback copies that data to `session.user`.

After that I can read values such as:

```js
res.locals.session.user.id;
res.locals.session.user.username;
```

### The JWT callback and session callback are for different jobs

This was an important lesson:

- `jwt()` controls what data is put inside or kept in the token.
- `session()` controls what data is copied to the session available to the app.

So the database user ID can be added to the JWT, but that ID is not useful until the session callback exposes it as `session.user.id`.

### Reading a cookie manually was not the best session check

In `controllers/login.js`, the app checks whether the Auth.js cookie exists before calling `getSession()`:

```js
req.headers.cookie?.includes('authjs.session-token');
```

(basicaly I could've avoided this by making a dedicated login signup page, but I wanted to give an overview of the app)

This avoids trying to read a session when the user is clearly logged out. One lesson from this is that checking for a cookie only tells us that a cookie exists; `getSession()` is still what gives us the actual session data.

The app also has a custom signup flow. After creating the user and its root folder, it manually encodes a JWT and sets `authjs.session-token`, so the new user is logged in immediately.

### Secrets

The `AUTH_SECRET` is also required. It is used to sign the session and should stay private in `.env`.

### Protecting database operations

Database actions use the logged-in user's ID. For example, files and folders are queried with `authorId` before they are shown or changed.

This is important because it means a user should only:

- See their own private folders and files
- Edit their own folders and files
- Delete their own folders and files

Public data is the exception: public files and folders can be read through shared links without a login.

### File uploads are two separate jobs

Multer first saves the physical file to `public/upload` with a random storage key. Prisma then stores the original name, MIME type, size and storage key in PostgreSQL.

That means deleting or changing a database record is not automatically the same as deleting the physical file. It is important to decide whether both systems need cleanup.

### Folder and file sharing

A public file or folder uses a `public` boolean in Prisma.

- Sharing a folder marks it and all of its files as public.
- Sharing one file also updates the folder public status if at least one file in that folder remains public.
- Shared routes only return public records.

## Main project files

```text
app.js                 Express setup and route registration
config/auth.js         Auth.js providers and session callbacks
lib/prisma.js          Prisma 7 PostgreSQL adapter setup
controllers/           Database and request logic
routes/                Express route definitions
views/                 EJS templates
prisma/schema.prisma   Database models and relations
prisma/migrations/     Database migration history
public/upload/         Uploaded files
```

## Project Tree

```text
file-uploader/
├── app.js                    # Starts Express and connects Auth.js and all routes
├── config/
│   └── auth.js               # Auth.js login providers and session callbacks
├── controllers/              # App logic for users, files, folders and storage
├── lib/
│   └── prisma.js             # Creates the Prisma and PostgreSQL connection
├── prisma/
│   ├── schema.prisma         # Database models and relations
│   └── migrations/           # Database change history
├── generated/prisma/         # Prisma-generated database client
├── routes/                   # Express route definitions
├── views/                    # EJS pages and reusable UI parts
├── public/
│   ├── css/                  # Styles for the app
<!-- │   └── upload/               # Physical uploaded files on the server -->
├── package.json              # Dependencies and project metadata
└── README.md                 # Project explanation and lessons learned
```

## Useful Prisma commands

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev
npx prisma migrate status
npx prisma generate
npx prisma studio
```

## shoutouts

A special shoutout to [egyjs](https://github.com/egyjs/icon-forge)! Their awesome open-source project made it effortless to give projects clean, crisp file icons seamlessly, without needing complex setups or heavy JavaScript bundles.

A special shoutout to [DiceBear](https://github.com/dicebear/dicebear)! Their fascinating project made it incredibly easy to provide users with random avatars and images seamlessly, without needing any JavaScript APIs.

## Finaly

doing a dashboard was a lot, this should've been a prisma small project, especialy Auth js was a lot.
