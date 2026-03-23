import React from "react";

const Footer = () => {
  return (
    <footer className="dark:bg-[#1a1f26] bg-white rounded-2xl flex justify-center items-center py-6 mt-5">
      <p className="lg:text-sm text-xs text-black/50 dark:text-white/50 text-center">
        developed by{" "}
        <a
          href="https://www.nexoviasoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors hover:underline font-medium"
        >
          NexoviaSoft
        </a>
      </p>
    </footer>
  );
};

export default Footer;
