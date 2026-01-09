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
      <h2 className="font-light text-xl sm:text-2xl text-black">{title}</h2>

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


