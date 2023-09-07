"use client"

import {signOut} from "next-auth/react";
import React from "react";

export default function Guest() {
    return (
        <>
            <button className="py-2 px-4 bg-fuchsia-300 rounded" onClick={() => signOut()}>Sign out</button>
            Очікуйте підтвердження реєстрації.
        </>
    )
}
