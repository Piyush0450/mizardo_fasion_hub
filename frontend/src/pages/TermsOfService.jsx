import React from 'react';

const TermsOfService = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-brand-black dark:text-white">Terms of Service</h1>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
                <section>
                    <h2 className="text-xl font-semibold mb-3 text-brand-black dark:text-white">1. Agreement to Terms</h2>
                    <p>
                        By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
                        If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-brand-black dark:text-white">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Mizardo's website for personal,
                        non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Modify or copy the materials;</li>
                        <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>Attempt to decompile or reverse engineer any software contained on Mizardo's website;</li>
                        <li>Remove any copyright or other proprietary notations from the materials; or</li>
                        <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-brand-black dark:text-white">3. Disclaimer</h2>
                    <p>
                        The materials on Mizardo's website are provided on an 'as is' basis. Mizardo makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-brand-black dark:text-white">4. Limitations</h2>
                    <p>
                        In no event shall Mizardo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Mizardo's website, even if Mizardo or a Mizardo authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-brand-black dark:text-white">5. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
