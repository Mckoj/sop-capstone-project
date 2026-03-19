
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <main className="flex flex-col items-center justify-center grow px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Nienalabs Starter Kit
        </h1>
        
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Your Next.js project is ready. Authentication and other configurations have been pre-configured.
        </p>

        <div className="p-4 border rounded-lg bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <p className="font-semibold">
            Please check the <code>README.md</code> file for setup instructions and documentation.
          </p>
        </div>
      </main>
    </div>
  );
}
