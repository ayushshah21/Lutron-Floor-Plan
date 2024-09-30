"use client";
import { io } from 'socket.io-client';

// Create a single Socket.io client instance
const socket = io('http://localhost:3000');

export default socket;