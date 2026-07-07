import { motion } from 'motion/react';
import { Linkedin, Github, GraduationCap, Award, BookOpen, ExternalLink } from 'lucide-react';

export default function AboutDeveloper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6 shadow-xl rounded-3xl liquid-glass-panel border-white/30 dark:border-white/10"
      id="about-developer-card"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            DP
          </div>
          <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md">
            <GraduationCap className="w-4 h-4" />
          </span>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50" id="dev-name">
            Debraj Pathak
          </h2>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-0.5">
            Computer Science & Engineering Student (4th Year)
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            Chandigarh University
          </p>

          <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-4 leading-relaxed">
            A passionate software engineer specialized in full-stack web architectures, numerical analysis, and complex interactive computing interfaces. This scientific calculator represents a high-fidelity emulator designed to recreate the tactical, high-performance nature of professional engineering tools directly in the browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Engineering Profile
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">
              Numerical Computing, Algorithms & Interactive UIs
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Education
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">
              B.E. Computer Science & Engineering
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <a
          href="https://www.linkedin.com/in/debraj-pathak-07038628a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-all cursor-pointer"
          id="btn-linkedin"
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href="https://github.com/debraj-pathak"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          id="btn-github"
        >
          <Github className="w-4 h-4" />
          <span>GitHub Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
