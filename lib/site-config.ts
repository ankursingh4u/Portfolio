export const siteConfig = {
  name: 'Ankur Singh',
  username: 'ankur_singh',
  title: 'Software Engineer',
  description: 'Building production-ready systems with clarity and ownership.',
  email: 'a4ankur.mail@gmail.com', 
  location: 'India',
  status: 'available for opportunities',

  social: {
    github: 'https://github.com/ankursingh4u',
    linkedin: 'https://www.linkedin.com/in/ankursingh4u',
    X: 'https://x.com/ankursingh4u_', 
  },

  meta: {
    url: 'https://ankursingh.dev',
    image: '/og-image.png',
    keywords: ['Software Engineer' ,'Full-Stack Engineer', 'Next.js', 'TypeScript', 'React', 'Node.js'],
  },
}

export const aboutContent = {
  intro: `Fast-learning Software Engineer with hands-on experience building real-world products using modern web technologies. Currently working as a Full-Stack Engineer Intern on a live production product (SaaS applications), contributing to feature development, system improvements, and scalable implementations.`,

  journey: `My journey began with deep involvement across 200+ Web3 projects, where I developed strong systems thinking, experimentation discipline, and understanding of decentralized ecosystems. I intentionally transitioned toward building practical, impact-driven digital products focused on usability, clarity, and long-term maintainability.`,

  approach: `I have independently built full-stack applications from scratch, including an AI-powered Farmer Assistant platform. I enjoy working on conceptual and boundary-pushing ideas, but I consistently prioritize clean architecture, readable code, and reliable engineering decisions.`,

  current: `Currently strengthening problem-solving fundamentals through Data Structures and Algorithms, with a focus on logical clarity and first-principles thinking. Looking ahead, I plan to expand into React Native for cross-platform development and DevOps fundamentals.`,

  beyond: `Outside of development, I enjoy reading, traveling, calisthenics, and watching films—which help me maintain discipline, perspective, and creative balance.`,
}

export const projects = [
   {
    id: 'production-saas',
    name: 'Enterprise SaaS',
    description: 'Contributing to live production product with feature development, OAuth authentication, and scalable system implementations.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'OAuth', 'Tailwind'],
    status: 'active',
    year: '2026-present',
    link: null,
    github: null,
  },
    {
    id: 'farmer-assistant',
    name: 'AgroMind',
    description: 'It integrates real-time environmental data, market insights, and crop health monitoring to provide contextual, multi-modal agricultural advice in the farmer’s own language.',
    tech: ['HTML5','CSS', 'Node.js', 'OpenAI API', 'MongoDB', 'Express'],
    status: 'completed',
    year: '2025',
    link: 'http://agromind-app.onrender.com/login.html',
    github: 'https://github.com/ankursingh4u/agromind-app',
  },

  {
    id: 'drive-clone',
    name: 'DocDrawer',
    description: 'A secure, full-stack file upload and download web application built using Node.js, Express, MongoDB, Supabase Storage, and EJS with TailwindCSS.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'AWS S3'],
    status: 'completed',
    year: '2024',
    link: 'https://docdrawer.onrender.com', 
    github: 'https://github.com/ankursingh4u/DocDrawer', 
  },
 
  
  {
    id: 'web3-exploration',
    name: 'Web3 Research',
    description: 'Deep exploration across 200+ decentralized projects, developing systems thinking and understanding of blockchain ecosystems.',
    tech: ['NFTs', 'Ethereum', 'DeFi', 'Research'],
    status: 'archived',
    year: '2018-2023',
    link: null,
    github: null,
  },
]

export const techStack = {
  languages: ['TypeScript', 'JavaScript', 'Python'],
  frontend: ['React', 'Next.js', 'Tailwind CSS','HTML5'],
  backend: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Supabase'],
  tools: ['Git', 'VS Code', 'Vercel', 'AWS', 'Docker'],
  learning: ['React Native', 'DevOps', 'System Design', 'DSA'],
}

export const commands = {
  help: 'List available commands',
  about: 'Display engineer profile',
  work: 'Show project portfolio',
  stack: 'List technical capabilities',
  contact: 'Get in touch',
  clear: 'Clear terminal',
}
