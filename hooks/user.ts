"use server";

import { auth, signOut } from "@/auth";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";

export async function getSessionUser() {
  return await auth();
}

export async function signOutUser() {
  return await signOut();
}

export async function getTypeOfUser() {
  const session = await auth();
  return session?.user.role;
}

type FetchUser = {
  id: string;
  name: string;
  email: string;
};

export async function getUserById(id: string): Promise<FetchUser | null> {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  });
  if (user) {
    return {
      id: id,
      name: user.name,
      email: user.email,
    };
  } else return null;
}

export type fetchUserByRole = {
  id: string;
  name: string;
  email: string;
  password: string;
};
export async function fetchUserByRole(
  role: Role,
  email: string
): Promise<fetchUserByRole | null> {
  switch (role) {
    case Role.CUSTOMER: {
      return await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });
    }
    case Role.SERVICE_CENTER: {
      return await prisma.serviceCenter.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });
    }
    case Role.ADMIN: {
      if (email !== process.env.ADMIN_EMAIL) {
        return null;
      }
      return {
        id: "admin",
        email: email,
        name: "Admin",
        password: process.env.ADMIN_PASS!,
      };
    }
    default: {
      return null;
    }
  }
}

export type fetchUserByRoleForJWT = {
  id: string;
  name: string;
  email: string;
};

export async function fetchUserByRoleForJWT(
  role: Role,
  email: string
): Promise<fetchUserByRoleForJWT | null> {
  switch (role) {
    case Role.CUSTOMER: {
      return await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }
    case Role.SERVICE_CENTER: {
      return await prisma.serviceCenter.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }
    case Role.ADMIN: {
      if (email !== process.env.ADMIN_EMAIL) {
        return null;
      }
      return {
        id: "admin",
        email: email,
        name: "Admin",
      };
    }
    default: {
      return null;
    }
  }
}
