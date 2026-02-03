'use client';
import Link from 'next/link';
import LandingFooter from '@/components/ui/LandingFooter';
import { FaArrowLeft, FaGavel } from 'react-icons/fa';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
            {/* Navbar/Header */}
            <header className="bg-white border-b border-rose-100 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group text-rose-600 font-medium hover:text-rose-700 transition-colors">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <FaGavel className="text-rose-500" />
                        <span className="font-bold text-gray-900">SewerVision.ai</span>
                    </div>
                </div>
            </header>


            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-rose-50">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Terms and Conditions</h1>
                    <p className="text-gray-500 mb-8">Last Updated: February 4, 2026</p>

                    <div className="prose prose-rose max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                            <p>
                                These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and SewerVision.ai (“we,” “us” or “our”),
                                concerning your access to and use of the SewerVision.ai application and website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
                            <p>
                                Unless otherwise indicated, the Site and the Services are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs,
                                and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us,
                                and are protected by copyright and trademark laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Representations</h2>
                            <p>By using the Site, you represent and warrant that:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                                <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
                                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
                            <p>
                                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
                            <p>
                                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages,
                                including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
