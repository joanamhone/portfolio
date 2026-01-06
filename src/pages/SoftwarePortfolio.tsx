import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code, Layers, Globe, Cpu, Database, ChevronLeft,Brain } from 'lucide-react';

import ProjectCard from '../components/ProjectCard';
import SkillBadge from '../components/SkillBadge';
import ExperienceItem from '../components/ExperienceItem';
import ContactForm from '../components/ContactForm';

// ShadCN UI components
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '../components/ui/drawer';
import{Button,} from '../components/ui/button'

const SoftwarePortfolio: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-20"
    >
      {/* Header */}
      <header className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-accent-software mb-6 transition-colors">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to home</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="inline-flex items-center space-x-2 mb-4">
                  <Code size={24} className="text-accent-software" />
                  <h1 className="text-3xl md:text-4xl font-bold">Software Engineering Portfolio</h1>
                </div>
                <p className="text-lg text-white/80 max-w-2xl">
                  Crafting elegant solutions and building scalable applications with a focus on clean code and user experience.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Skills Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Technical Skills</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SkillCategory 
              icon={<Layers size={20} />} 
              title="Frontend"
              skills={[
                "React", 
                "React Native",
                "TypeScript", 
                "Next.js", 
                "Tailwind CSS", 
                "JavaScript", 
                "HTML",
                "CSS", 
                "Figma" 
                     ]} 
                   />
            
            <SkillCategory 
              icon={<Database size={20} />} 
              title="Backend"
              skills={[
                "Node.js", 
                "Express", 
                "Python", 
                "Flask",
                "Ruby on Rails",
                "PostgreSQL", 
                "MariaDB" 
              ]} 
            />
            
            <SkillCategory 
              icon={<Globe size={20} />} 
              title="DevOps"
              skills={[
                "Docker", 
                "CI/CD", 
                "AWS", 
                "GCP",
                "Kubernetes"
              ]} 
            />

            <SkillCategory 
                icon={<Brain size={20} />} 
                title="AI/ML"
                skills={[
                  "Python",
                  "Data Preprocessing",
                  "Kaldi", 
                  "TensorFlow", 
                  "DeepSpeech", 
                  "Speech Recognition", 
                  "Model Training"
                ]}
              />
            
            <SkillCategory 
              icon={<Cpu size={20} />} 
              title="Architecture"
              skills={[
                "Microservices", 
                "REST APIs", 
                "GraphQL", 
                "System Design"
              ]} 
            />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <ProjectCard 
              title="Soil Analysis & Crop Recommendation System"
              description="Designed a system using IoT sensors and machine learning to analyze soil components and recommend crops suitable for specific soil conditions. Focused on ML model development and integration."
              tags={["IoT", "Machine Learning", "Python", "Soil Sensors", "Smart Agriculture"]}
              accentColor="software"
            />

          <ProjectCard 
            title="AI Health Monitoring System"
            description="Developed a real-time hypertension monitoring system during a hackathon, leveraging machine learning models to track and analyze patient vitals."
            tags={["Machine Learning", "Python", "Healthcare", "Hypertension", "IoT"]}
            accentColor="software"
          />

          <ProjectCard 
                  title="Offline Speech-to-Text Learning App for Deaf Students"
                  description="Built an AI-powered classroom note-taking app using Vosk to support students with hearing impairments in low-connectivity regions. The app performs real-time offline speech-to-text transcription tailored for Malawian English."
                  tags={[ "Vosk", "Python", "Android", "Speech Recognition"]}
                  accentColor="software"
                />
            
              <ProjectCard 
                title="Kaldi-Based Speech Model Fine-Tuning"
                description="Fine-tuned a Kaldi TDNN model on a custom dataset using minilibrespeech for offline speech recognition. Involved data preprocessing, alignment, feature extraction, and training pipeline optimization."
                tags={["Kaldi", "TDNN", "Python", "Data Preprocessing", "ASR", "Linux"]}
                accentColor="software"
              />

              <ProjectCard 
                  title="Clinic Patient Registration & Payment System"
                  description="Customized a Ruby on Rails-based patient management system to fit the specific workflows of a local clinic. Focused on reviewing and adapting legacy code from a different hospital, with tailored modules for registration and billing."
                  tags={["Ruby on Rails", "MariaDB", "Code Review", "Health Tech"]}
                  accentColor="software"
                />
              <ProjectCard 
                  title="Canventory – Clinic Management System"
                  description="Built a full-stack system to manage patient intake, treatment tracking, inventory, and clinic cashflow. The platform provides real-time data visualizations with interactive graphs and supports report generation to help clinics monitor operations efficiently."
                  tags={["React", "Vite", "Supabase", "TypeScript", "Data Visualization", "Healthcare", "Vercel"]}
                  accentColor="software"
                />


          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Professional Experience</h2>
          
          <div className="space-y-8">
            
        <ExperienceItem 
        title="Informatics Intern"
        company="Global Health Informatics Institute (GHII)"
        period="Aug 2024 – Nov 2024"
        description="Worked on health informatics solutions for low-resource settings, including clinical and internal systems. Contributed to patient registration systems, mobile health tools, and employee management platforms."
        highlights={[
          "Customized and deployed a Ruby on Rails-based billing and patient registration system for a rural clinic",
          "Integrated MariaDB and hardware components including Zebra printers and barcode scanners",
          "Assisted in the continued rollout and maintenance of GHII’s internal employee management system (OMIS)",
          "Participated in Agile sprint reviews and cross-team planning, offering technical input on healthcare software initiatives"
        ]}
      />


            
          </div>
        </div>
      </section>

      {/* Open Source Contributions
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Open Source Contributions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-lg mb-2">React Performance Utils</h3>
              <p className="text-white/80 mb-4">
                A collection of utilities for optimizing React application performance. Contributed core memoization utilities and documentation.
              </p>
              <div className="flex flex-wrap gap-2">
                <SkillBadge label="React" type="software" />
                <SkillBadge label="Performance" type="software" />
                <SkillBadge label="TypeScript" type="software" />
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-bold text-lg mb-2">GraphQL Schema Generator</h3>
              <p className="text-white/80 mb-4">
                A tool for automatically generating GraphQL schemas from database models. Contributed validation and documentation features.
              </p>
              <div className="flex flex-wrap gap-2">
                <SkillBadge label="GraphQL" type="software" />
                <SkillBadge label="Node.js" type="software" />
                <SkillBadge label="Database" type="software" />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-dark to-secondary">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Looking for a software engineering collaborator?
            </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            I'm passionate about building innovative solutions and always open to new opportunities.
          </p>
           <Button
    variant="primary"
    className="btn-primary inline-flex items-center space-x-2"
    onClick={() => setIsOpen(true)}
  >
    Get in Touch
  </Button>

  <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Contact Me</DrawerTitle>
        <DrawerDescription>
          Send a message and I’ll get back to you.
        </DrawerDescription>
      </DrawerHeader>
      <div className="p-4">
        <ContactForm />
      </div>
      </DrawerContent>
  </Drawer>
        </div>
      </section>
    </motion.div>
  );
};

interface SkillCategoryProps {
  icon: React.ReactNode;
  title: string;
  skills: string[];
}

const SkillCategory: React.FC<SkillCategoryProps> = ({ icon, title, skills }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <div className="text-accent-software">{icon}</div>
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <SkillBadge key={index} label={skill} type="software" />
        ))}
      </div>
    </div>
  );
};

export default SoftwarePortfolio;