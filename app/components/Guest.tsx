"use client"

import {signOut} from "next-auth/react"
import React from "react"

export default function Guest() {
    return (
            <div
                className="relative overflow-hidden bg-cover bg-no-repeat p-12 text-center h-screen w-screen"
                style={{backgroundImage: 'url("/bg.jpg")'}}
            >
                <div
                    className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed"
                    style={{backgroundColor: "rgba(0, 0, 0, 0.65)"}}>
                    <div className="flex h-full items-center justify-center">
                        <div className="text-white">
                            <h2 className="mb-12 text-4xl font-semibold">Очікуйте підтвердження реєстрації.</h2>
                            <div className="flex items-center justify-around mx-12">
                                <button
                                    className="font-bold font-sans rounded border-2 border-neutral-50 py-9 px-9 pb-[8px] pt-[10px] text-sm uppercase leading-normal text-neutral-50 transition duration-150 ease-in-out hover:border-neutral-100 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-neutral-100 focus:border-neutral-100 focus:text-neutral-100 focus:outline-none focus:ring-0 active:border-neutral-200 active:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
                                    data-te-ripple-color="light"
                                    onClick={() => signOut()}
                                >
                                    Вийти
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}
