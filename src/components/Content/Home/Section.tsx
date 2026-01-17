"use client";

import React from "react";

export default function Section({
  id,
  title,
  children,
  bordered = true,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <section className="px-6 py-6 bg-gray-200" id={id}>
      <h2 className="font-light text-xl sm:text-2xl text-black">
        <a href="#" className="inline-flex items-center gap-2">
          <span>{title}</span>
          <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m13 5 7 7-7 7"></path>
            </svg>
          </span>
        </a>
      </h2>

      <div
        className={
          bordered
            ? "w-full mt-4 border border-black rounded-xl p-6 bg-gray-200"
            : "w-full mt-4"
        }
      >
        {children}
      </div>
    </section>
  );
}


