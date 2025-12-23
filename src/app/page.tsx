export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get started by editing{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
            src/app/page.tsx
          </code>
        </p>
        <div className="flex gap-4">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
          >
            Read the Docs
          </a>
          <a
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Learn Next.js
          </a>
        </div>
      </main>
    </div>
  );
}
