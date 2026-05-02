import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-512",
    },
    key,
    64 * 8
  )
  
  const hash = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `${saltHex}:${hash}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
  const encoder = new TextEncoder()
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-512",
    },
    key,
    64 * 8
  )
  
  const computedHash = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return hashHex === computedHash
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first()

    if (existingUser) {
      throw new Error("Email already in use")
    }

    const hashedPassword = await hashPassword(args.password)

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: hashedPassword,
      name: args.name,
      role: args.role,
      subscriptionStatus: "free",
      streak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    })

    const user = await ctx.db.get(userId)
    return { success: true, user }
  },
})

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first()

    if (!user || !(await verifyPassword(args.password, user.password))) {
      throw new Error("Invalid email or password")
    }

    return { success: true, user }
  },
})

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }
    return await ctx.db.get(args.userId)
  },
})

export const getLeaderboard = query({
  args: {},
  handler: async (_ctx) => {
    return []
  },
})