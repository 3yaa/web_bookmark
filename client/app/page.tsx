import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
      <div className="flex gap-5">
        <Link href="/auth">Users</Link>
        <Link href="/books">Books</Link>
        <Link href="/movies">Movies</Link>
        <Link href="/shows">Shows</Link>
      </div>
    </main>
  );
}
