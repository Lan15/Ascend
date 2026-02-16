import React from 'react';
import GemsDisplay from "../../gamification/GemsDisplay";

export default function GemsWidget({ user }) {
  return (
    <GemsDisplay 
      gems={user?.gems || 0}
      streakFreezes={user?.streak_freezes || 0}
      user={user}
    />
  );
}