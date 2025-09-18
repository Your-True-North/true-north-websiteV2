const userService = { 
  async createUser(userData) { 
    const user = { id: Date.now(), ...userData, createdAt: new Date() }; 
    console.log("Created user:", user); 
    return user; 
  }, 
  async findUserByEmail(email) { return null; } 
};
const activityService = { 
  async createActivity(activityData) { 
    const activity = { id: Date.now(), ...activityData, createdAt: new Date() }; 
    console.log("Created activity:", activity); 
    return activity; 
  }, 
  async logActivity() { return {}; } 
};
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
