import { Link } from "react-router-dom"

export function Footer() {
   return (
      <footer className="mt-auto border-b border-slate-700 bg-slate-800/90 backdrop-blur">
         <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 text-zinc-200">
            <p>All rights reserved... maybe... ya hz</p>
            <p><Link to="/u/nosensejk" className="hover:text-zinc-400">@nosensejk</Link>  2026</p>
         </div>
      </footer>
   )
}