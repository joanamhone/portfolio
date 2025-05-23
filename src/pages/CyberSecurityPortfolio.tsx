import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  FileWarning,
  Network,
  Server,
  ChevronLeft,
  Code,
} from 'lucide-react';

import ContactForm from '../components/ContactForm';
import ProjectCard from '../components/ProjectCard';
import SkillBadge from '../components/SkillBadge';
import ExperienceItem from '../components/ExperienceItem';

// ShadCN UI components
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '../components/ui/drawer';
import{Button,} from '../components/ui/button'

const CyberSecurityPortfolio: React.FC = () => {
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
      <header className="py-20 px-4">
        <div className="container mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-white/70 hover:text-accent-cyber mb-6 transition-colors"
          >
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
                  <Shield size={24} className="text-accent-cyber" />
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Cybersecurity Portfolio
                  </h1>
                </div>
                <p className="text-lg text-white/80 max-w-2xl">
                  Specialized in protecting digital assets and securing infrastructure against evolving threats.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Skills Section */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Technical Skills</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SkillCategory
              icon={<Lock size={20} />}
              title="Security"
              skills={['Penetration Testing', 'Vulnerability Assessment', 'SIEM', 'Security Audits']}
            />
            <SkillCategory
              icon={<FileWarning size={20} />}
              title="Compliance"
              skills={['ISO 27001', 'GDPR', 'NIST Framework', 'SOC 2']}
            />
            <SkillCategory
              icon={<Network size={20} />}
              title="Network"
              skills={['Firewall Configuration', 'IDS/IPS', 'Network Monitoring']}
            />
            <SkillCategory
              icon={<Code size={20} />}
              title="Automation & Tooling"
              skills={['Python', 'Bash', 'Terraform', 'Threat Intelligence', 'Log Parsing', 'Data Pipelines']}
            />
            <SkillCategory
              icon={<Server size={20} />}
              title="Infrastructure"
              skills={['Cloud Security', 'Docker Security', 'Kubernetes', 'IAM']}
            />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard
              title="Enterprise Threat Detection System"
              description="Designed and implemented a comprehensive threat detection system using Wazuh SIEM to monitor and alert on security incidents."
              tags={['SIEM', 'Wazuh', 'Threat Intelligence']}
              accentColor="cyber"
            />
            <ProjectCard
              title="Zero Trust Network Implementation"
              description="Led the implementation of a zero trust architecture for a education sector client's network, reducing attack surface and improving security posture."
              tags={['Zero Trust', 'Identity Management', 'Network Security', 'Network Restructuring']}
              accentColor="cyber"
            />
            <ProjectCard
              title="Infrastructure Hardening Initiative"
              description="Redesigned firewall configurations and implemented system hardening measures across MAREN's infrastructure to enhance overall security posture."
              tags={['Firewall', 'Hardening', 'Linux', 'Network Security']}
              accentColor="cyber"
            />
            <ProjectCard
              title="Threat Intelligence Automation"
              description="Developed a Python-based parser to process Shadowserver threat feeds, enabling real-time threat awareness and faster response capabilities."
              tags={['Python', 'Threat Intelligence', 'Shadowserver', 'Automation']}
              accentColor="cyber"
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Professional Experience</h2>
          <div className="space-y-8">
            <ExperienceItem
              title="Cybersecurity Analyst"
              company="MAREN (Malawi Research and Education Network)"
              period="2023 - Present"
              description="Deploys and manages centralized security infrastructure, coordinates incident response, and automates threat intelligence across the national research and education network."
              highlights={[
                'Deployed and manages a centralized Wazuh SIEM server aggregating logs from critical internal infrastructure and endpoints.',
                'Monitors, triages, and responds to real-time incidents using rule-based alerts, dashboards, and log correlation.',
                'Conducts regular vulnerability assessments and external surface discovery with tools like Nmap and Censys.',
                'Integrates threat intelligence feeds from Shadowserver to identify actionable insights and early indicators of compromise.',
                'Develops Python automation scripts to streamline alert handling, feed ingestion, and log parsing.',
                'Supports firewall configuration and infrastructure hardening to reduce attack surfaces and strengthen defense-in-depth.',
                'Prepares tailored security reports aligned to both technical detail and business context.',
                'Communicates findings to clients and teams in structured, non-technical formats to support risk-based decisions.',
                'Assists in cybersecurity awareness training and contributes to internal policy development and guidelines.',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CertificationCard title="Cybersecurity Threat Vectors and Mitigation" issuer="Microsoft" date="2024" />
            <CertificationCard title="Cybersecurity Identity and Access Solutions using Azure AD" issuer="Microsoft" date="2024" />
          </div>
        </div>
      </section>

     <section className="py-16 px-4 text-center">
  <div className="container mx-auto text-center">
  <h2 className="text-2xl md:text-3xl font-bold mb-6">
    Interested in cybersecurity collaboration?
  </h2>
  <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
    I'm always open to discussing cybersecurity challenges, projects, or
    opportunities.
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

const SkillCategory: React.FC<SkillCategoryProps> = ({ icon, title, skills }) => (
  <div className="card">
    <div className="flex items-center space-x-2 mb-4">
      <div className="text-accent-cyber">{icon}</div>
      <h3 className="font-bold">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <SkillBadge key={index} label={skill} type="cyber" />
      ))}
    </div>
  </div>
);

interface CertificationCardProps {
  title: string;
  issuer: string;
  date: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({ title, issuer, date }) => (
  <div className="card flex flex-col h-full">
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <div className="text-white/70 text-sm mt-auto">
      <p>{issuer}</p>
      <p>Issued: {date}</p>
    </div>
  </div>
);

export default CyberSecurityPortfolio;
