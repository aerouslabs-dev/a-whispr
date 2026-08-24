# Whispr AI

Create a new project with AI enabled.

Build a viral anonymous messaging web app named 'A Whispr', created by Aerous Labs (linked to https://aerouslabs.netlify.app).

🎨 UI/UX Aesthetic (Playful & Cartoonish Kawaii):

Drop the boring dark/glass look. Use a gorgeous, vibrant pastel-pink & soft-purple gradient background inspired by cute anime/kawaii UI design.

Rounded retro windows, soft floating clouds/stars animations (using Framer Motion), playful bouncy buttons, and clean friendly typography.

A customized cartoonish app logo in the top navbar.

Footer must display: "A Product by Aerous Labs | All Rights Reserved".

🔐 Authentication & Access:

Support Guest Mode (visitors can browse the homepage and read public info, but cannot send whispers without logging in).

Login options: Email/Password (Supabase Auth) and Google/Gmail social login.

⚙️ Core Features & Pages:

User Dashboard (/):

Authenticated users get their unique public link (/u/username) and an inbox showing received anonymous whispers fetched from Supabase.

Global Announcements: If the admin publishes an announcement, it floats dynamically at the top of the dashboard.

Public Submission Page (/u/:username):

Visitors see a cute, bouncy card: "Send an anonymous whisper to @username".

Text input supports Bengali, English, and Banglish slangs.

On submit, pass text through the AI Connector to generate a Vibe Tag (e.g., '90% Crush', '99% Savage Roast') and a witty 1-liner AI Comeback Reply, then save to Supabase.

NGL-Style Instant Instagram Sharing:

Add a prominent 'Share on Instagram' button on the user dashboard.

Implement native Web Share API (navigator.share) combined with Instagram story deep-linking (instagram-stories://share / web intent) so that clicking it instantly triggers the device to open Instagram Story with the user's public 'A Whispr' link/sticker pre-loaded without multiple steps.

Settings Page:

Appearance options and a direct redirect card to Aerous Labs (https://aerouslabs.netlify.app).

Super Admin Panel (/admin):

Secured login page with exact credentials: Username: admin, Password: adminaera56917.

Full control dashboard to manage users, delete messages, view analytics, and broadcast global announcements.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4519365c-eadb-4234-8de5-023efd122ace).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
