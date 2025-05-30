"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);

  return (
    <header className="w-full bg-white">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
        <Link href="/" className="flex items-center m-3">
          <Image
            src="/logo.svg"
            alt="THE STEP to healthier"
            width={350}
            height={50}
            priority
          />
        </Link>
        <nav className="flex gap-8 text-sm">
          <Link
            href="/about-the-step"
            className="text-[#666666] hover:text-[#333333]"
          >
            About THE STEP
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsPartnersOpen(!isPartnersOpen)}
              className="flex items-center text-[#666666] hover:text-[#333333]"
            >
              THE STEP partners
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center text-[#666666] hover:text-[#333333]"
            >
              <span className="flex items-center">
                🌐 English
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main header */}
      <div className="border-t border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto flex justify-end items-center px-4 py-4">
          {/* Main navigation */}
          <nav className="hidden lg:flex gap-10">
            <Link
              href="/"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Home
            </Link>
            <Link
              href="/healthy-and-fit"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Healthy and fit
            </Link>
            <Link
              href="/mentally-strong"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Mentally strong
            </Link>
            <Link
              href="/meaningful-life"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Meaningful life
            </Link>
            <Link
              href="/quality-of-life"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Quality of life
            </Link>
            <Link
              href="/contact-with-others"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Contact with others
            </Link>
            <Link
              href="/taking-care-of-yourself"
              className="text-[#333333] hover:text-[#000000] font-medium"
            >
              Taking care of yourself
            </Link>
          </nav>

          {/* Search button */}
          <button className="p-3 text-white bg-[#DC2626] hover:bg-[#B91C1C] ml-8">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
