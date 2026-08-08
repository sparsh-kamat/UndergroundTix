# SubscriptionTrackr 📈

A modern, full-stack application designed to help you effortlessly track and manage your recurring subscriptions. Get a clear overview of your monthly and yearly spending with an interactive dashboard.

[Live Demo](https://subsciptiontrackr.vercel.app/) · [MIT License](./LICENSE)

## ✨ Live Demo

Check out the live application hosted on Vercel:
**[https://subsciptiontrackr.vercel.app/](https://subsciptiontrackr.vercel.app/)**

![ScreenRecording2025-06-08at4 26 04AM-ezgif com-cut](https://github.com/user-attachments/assets/84938ccb-1c51-4edd-84ce-a1b2e52b6541)

## 🚀 Key Features

  * **Secure User Authentication:** Sign up and log in using email/password credentials or social providers like Google. Built with **NextAuth.js (Auth.js v5)**.
  * **Full CRUD Functionality:** Easily **C**reate, **R**ead, **U**pdate, and **D**elete your subscriptions.
  * **Interactive Dashboard:** A central hub to visualize your spending with key metrics:
      * Total Monthly & Yearly Cost calculations.
      * Active subscription count.
      * Upcoming renewal alerts.
  * **Spending Visualization:** A dynamic pie chart shows your spending distribution by category.
  * **Automated Date Logic:** The "Next Billing Date" is automatically calculated based on the last billing date and the selected billing cycle, including handling complex month-end scenarios.
  * **Modern & Responsive UI:** Built with **shadcn/ui** and **Tailwind CSS**, offering a clean, modern interface that works on all devices.
  * **Dark/Light Mode:** A theme toggle with an animated icon to switch between light and dark modes, with user preference saved via `next-themes`.

## 🛠️ Tech Stack

This project is built with a modern, full-stack TypeScript setup:

  * **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)
  * **UI:** [React 19](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
  * **Database ORM:** [Prisma](https://www.prisma.io/)
  * **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/))
  * **Authentication:** [NextAuth.js (Auth.js v5)](https://authjs.dev/)
  * **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
  * **Charting:** [Recharts](https://recharts.org/)
  * **Deployment:** [Vercel](https://vercel.com/)

