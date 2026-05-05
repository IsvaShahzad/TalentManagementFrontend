import React from 'react'


export const getVisibleSkills = (skills = [], limit = 6) => {
  const visible = skills.slice(0, limit);
  const remaining = skills.length - limit;
  return { visible, remaining };
};


