import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import "../styles/components/navbar.css";

export default function NavBar() {
  const { status, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Watch a marker at the top of the page: when it leaves the viewport, we've scrolled
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting);
      if (entry.isIntersecting) setOpen(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const close = () => setOpen(false);
  const classes = ['nav', scrolled && 'nav--collapsed', open && 'nav--open']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div ref={sentinelRef} className="nav-sentinel" aria-hidden="true" />
      <nav className={classes}>
        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
        <div className="nav-menu-wrap">
          <ul id="nav-menu" className="nav-menu">
            <li><Link to="/" onClick={close}>Home</Link></li>
            <li><Link to="/feeds" onClick={close}>My Feeds</Link></li>
            <li><Link to="/discover" onClick={close}>Add Feed</Link></li>
            {status === 'authenticated' && (
              <li>
                <button onClick={() => { close(); logout(); }}>Log Out</button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}