import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-rose-100 py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent mb-4">
                            SewerVision.ai
                        </h3>
                        <p className="text-gray-600 max-w-sm">
                            Next-generation pipeline inspection platform powered by artificial intelligence.
                            Automating defect detection and streamlining infrastructure maintenance.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/whats-new" className="hover:text-rose-600 transition-colors">What's New</Link></li>
                            <li><Link href="/login" className="hover:text-rose-600 transition-colors">Login</Link></li>
                            <li><Link href="/register" className="hover:text-rose-600 transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/privacy-policy" className="hover:text-rose-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-rose-600 transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-rose-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} SewerVision.ai. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-rose-600 transition-colors"><FaGithub className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-rose-600 transition-colors"><FaTwitter className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-rose-600 transition-colors"><FaLinkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
