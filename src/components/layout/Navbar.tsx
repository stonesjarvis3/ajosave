import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NavLink } from "./NavLink";
import styles from "./Navbar.module.css";

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="Main navigation">
        <Link href="/" className={styles.logo} aria-label="Ajosave home">
          <span className={styles.logoMark}>A</span>
          <span className={styles.logoText}>Ajosave</span>
        </Link>
        <ul className={styles.links} role="list">
          <li><NavLink href="/circles">Browse Circles</NavLink></li>
          <li><NavLink href="/dashboard">Dashboard</NavLink></li>
          {isAdmin && <li><NavLink href="/admin">Admin</NavLink></li>}
          {session?.user
            ? <li><NavLink href="/profile">Profile</NavLink></li>
            : <li><Link href="/auth/login" className="btn btn--primary btn--sm">Sign In</Link></li>
          }
          <li><ThemeToggle /></li>
        </ul>
      </nav>
    </header>
  );
}
