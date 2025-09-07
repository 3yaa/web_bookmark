import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
      <Link href="/auth">Users</Link>
      <Link href="/books">Books</Link>
    </main>
  );
}
