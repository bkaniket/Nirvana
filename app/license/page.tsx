export default function LicensePage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-gray-100 -mt-6 -mx-6">
      
    
      {/* Document Content - Clean White Background */}
      <div className="p-10 bg-white text-gray-800 w-full">
        
        {/* EULA Title - Centered Underlined */}
        <h1 className="text-center text-2xl font-bold tracking-wide underline mb-8 text-gray-900">
          END-USER SOFTWARE LICENSE AGREEMENT (EULA)
        </h1>

        {/* Agreement Intro Paragraphs */}
        <p className="text-sm leading-6 mb-4 text-gray-700">
          This End-User Software License Agreement (“Agreement”) is a legal agreement between you (the “End-User”) and{' '}
          <span className="font-semibold">Nirvana Softech Inc.</span> (“Company”), governing your use of the software 
          application and related documentation made available by the Company.
        </p>

       <p className="text-sm leading-6 mb-12 text-gray-700 font-semibold">
          By installing, accessing, or using the Licensed Software, you agree to be bound by the terms of this Agreement.
        </p>

        {/* 1. Definitions */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          1. Definitions
        </h2>
        <p className="text-sm leading-6 mb-6 text-gray-700">For purposes of this Agreement:</p>
        
        <div className="ml-8 space-y-4 mb-12">
          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.1 “End-User”</h3>
            <p className="text-sm leading-6 text-gray-700">Means the specific department, division, company, or corporation that has licensed the Software for use at the Designated Location. Any affiliate, subsidiary, parent, or related entity requires a separate license unless otherwise agreed in writing.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.2 “License”</h3>
            <p className="text-sm leading-6 text-gray-700">The non-exclusive, non-transferable right granted under this Agreement to use the Licensed Software.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.3 “Licensed Users”</h3>
            <p className="text-sm leading-6 text-gray-700">The maximum number of concurrent user sessions permitted under the applicable License.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.4 “Licensed Copies”</h3>
            <p className="text-sm leading-6 text-gray-700">The maximum number of permitted installations or instances of the Licensed Software.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.5 “Licensed Software”</h3>
            <p className="text-sm leading-6 text-gray-700">The Nirvana Softech Symmetry software application, including associated documentation and updates provided under a valid maintenance agreement.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.6 “Prime Contract”</h3>
            <p className="text-sm leading-6 text-gray-700">A contract awarded directly by the U.S. Federal Government to a contractor.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.7 “Proprietary Rights”</h3>
            <p className="text-sm leading-6 text-gray-700">All patents, copyrights, trademarks, trade secrets, know-how, confidential information, software code, documentation, and related intellectual property rights worldwide.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.8 “Term”</h3>
            <p className="text-sm leading-6 text-gray-700">The license duration specified in the executed Software License Agreement.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.9 “Third-Party Software”</h3>
            <p className="text-sm leading-6 text-gray-700">Software owned by third parties and provided with or embedded in the Licensed Software, subject to separate license terms.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.10 “Use”</h3>
            <p className="text-sm leading-6 text-gray-700">Loading, installing, executing, accessing, or displaying the Licensed Software on Designated Equipment.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.11 “User Documentation”</h3>
            <p className="text-sm leading-6 text-gray-700">Manuals, installation guides, specifications, and related materials provided by the Company.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.12 “Designated Equipment”</h3>
            <p className="text-sm leading-6 text-gray-700">The hardware systems on which the Licensed Software is authorized to operate.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">1.13 “Designated Location”</h3>
            <p className="text-sm leading-6 text-gray-700">The geographic location of the Designated Equipment.</p>
          </div>
        </div>

        {/* 2. Grant of License */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          2. Grant of License
        </h2>
        <div className="ml-6 space-y-3 mb-12">
          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">2.1</h3>
            <p className="text-sm leading-6 text-gray-700 mb-2">Subject to this Agreement, the Company grants the End-User a non-exclusive, non-transferable license to use the Licensed Software:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-4 list-disc space-y-1">
              <li>During the Term</li>
              <li>On the Designated Equipment</li>
              <li>At the Designated Location</li>
              <li>Within the Licensed Copies and Licensed Users limits</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">2.2</h3>
            <p className="text-sm leading-6 text-gray-700">The Company retains all title and ownership in the Licensed Software.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">2.3</h3>
            <p className="text-sm leading-6 text-gray-700">No rights are granted except those expressly stated.</p>
          </div>
        </div>

        {/* 3. Government Rights */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          3. Government Rights
        </h2>
        <div className="ml-6 space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700">If the End-User is a U.S. Government entity:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-4 list-disc space-y-1">
            <li>The Licensed Software is "Commercial Computer Software."</li>
            <li>Government use is subject to applicable FAR and DFARS restrictions.</li>
            <li>Rights are limited to those expressly granted under this Agreement.</li>
          </ul>
        </div>

        {/* 4. Permitted Use */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          4. Permitted Use
        </h2>
        <div className="space-y-6 mb-12">
          <div>
            <p className="font-semibold text-sm text-gray-900 mb-2">The End-User may:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
              <li>Install and run Licensed Copies within purchased limits</li>
              <li>Make one archival backup copy</li>
              <li>Use the Software internally for its business purposes</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900 mb-2">The End-User shall not:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
              <li>Reverse engineer, decompile, or disassemble the Software</li>
              <li>Modify, adapt, or create derivative works</li>
              <li>Distribute, sublicense, rent, lease, or provide access to third parties</li>
              <li>Remove proprietary notices</li>
              <li>Use the Software to build or develop a competing product</li>
              <li>Use the Software to provide commercial services to third parties</li>
            </ul>
            <p className="text-sm leading-6 text-gray-700 mt-3">The Company may implement security controls to prevent unauthorized use.</p>
          </div>
        </div>

        {/* 5. License Fees */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          5. License Fees
        </h2>
        <div className="space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700">Additional fees apply if Licensed User or Copy limits are exceeded.</p>
          <p className="text-sm leading-6 text-gray-700">Changes to Designated Equipment require prior written approval if they impact licensing scope.</p>
        </div>

        {/* 6. Maintenance and Support */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          6. Maintenance and Support
        </h2>
        <p className="text-sm leading-6 text-gray-700 mb-12">Maintenance and updates are provided only under a separate maintenance agreement and subject to payment of applicable fees.</p>

        {/* 7. End-User Obligations */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          7. End-User Obligations
        </h2>
        <div className="ml-6 mb-12">
          <p className="font-semibold text-sm text-gray-900 mb-2">The End-User agrees to:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-4 list-disc space-y-1">
            <li>Maintain accurate records of installations</li>
            <li>Protect the Software from unauthorized access</li>
            <li>Reproduce copyright notices on permitted copies</li>
            <li>Comply with applicable laws</li>
            <li>Maintain appropriate data backups</li>
          </ul>
        </div>

        {/* 8. Intellectual Property */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          8. Intellectual Property
        </h2>
        <div className="space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700">All Proprietary Rights in the Licensed Software remain the exclusive property of Nirvana Softech Inc. or its licensors.</p>
          <p className="text-sm leading-6 text-gray-700">No ownership rights transfer to the End-User.</p>
        </div>

        {/* 9. Warranty Disclaimer */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          9. Warranty Disclaimer
        </h2>
        <div className="space-y-4 mb-12">
          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">9.1 Limited Warranty</h3>
            <p className="text-sm leading-6 text-gray-700">The Company warrants that the Licensed Software will substantially conform to its documentation for thirty (30) days from delivery.</p>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">9.2 Disclaimer</h3>
            <p className="text-sm leading-6 text-gray-700 font-semibold uppercase tracking-wide mb-2">Except as expressly stated:</p>
            <p className="text-sm leading-6 text-gray-700 font-bold text-lg mb-3">
              THE LICENSED SOFTWARE IS PROVIDED “AS IS” AND “AS AVAILABLE.”
            </p>
            <p className="text-sm leading-6 text-gray-700">The Company disclaims all warranties, including:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>
            <p className="text-sm leading-6 text-gray-700 mt-2">Some jurisdictions may not allow certain exclusions.</p>
          </div>
        </div>

        {/* 10. Limitation of Liability */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          10. Limitation of Liability
        </h2>
        <div className="ml-6 space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700 font-semibold">To the maximum extent permitted by law:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-4 list-disc space-y-1">
            <li>The Company shall not be liable for indirect, incidental, consequential, or special damages.</li>
            <li>The Company shall not be liable for loss of data, profits, business, or goodwill.</li>
            <li>Total liability shall not exceed the license fees paid during the twelve (12) months preceding the claim.</li>
          </ul>
        </div>

        {/* 11. Indemnification */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          11. Indemnification
        </h2>
        <div className="space-y-4 mb-12">
          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">11.1 Company Indemnity</h3>
            <p className="text-sm leading-6 text-gray-700">The Company shall defend the End-User against third-party claims that the Licensed Software infringes valid intellectual property rights, provided:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
              <li>The End-User promptly notifies the Company</li>
              <li>The Company controls the defense</li>
              <li>The End-User cooperates reasonably</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mt-4 mb-1 text-sm text-gray-900">11.2 Remedies</h3>
            <p className="text-sm leading-6 text-gray-700">If infringement occurs, the Company may:</p>
            <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
              <li>Procure continued use rights</li>
              <li>Modify the Software</li>
              <li>Replace the Software</li>
              <li>Refund applicable fees and terminate the License</li>
            </ul>
          </div>
        </div>

        {/* 12. Confidentiality */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          12. Confidentiality
        </h2>
        <div className="space-y-4 mb-12">
          <p className="text-sm leading-6 text-gray-700">All non-public technical or business information provided by the Company is confidential.</p>
          <p className="font-semibold text-sm text-gray-900 mb-2">The End-User shall:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
            <li>Use Confidential Information only for permitted purposes</li>
            <li>Not disclose it to third parties</li>
            <li>Protect it with reasonable safeguards</li>
          </ul>
          <p className="text-sm leading-6 text-gray-700">Confidentiality obligations survive termination.</p>
        </div>

        {/* 13. Termination */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          13. Termination
        </h2>
        <div className="space-y-4 mb-12">
          <p className="font-semibold text-sm text-gray-900 mb-2">The Company may terminate this Agreement if:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
            <li>The End-User materially breaches its terms</li>
            <li>License fees are unpaid</li>
            <li>The End-User becomes insolvent</li>
          </ul>
          <p className="font-semibold text-sm text-gray-900 mt-4 mb-2">Upon termination, the End-User must:</p>
          <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-1">
            <li>Cease all use</li>
            <li>Destroy or return all copies</li>
            <li>Certify compliance in writing</li>
          </ul>
        </div>

        {/* 14. Assignment */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          14. Assignment
        </h2>
        <div className="space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700">The End-User may not assign this Agreement without prior written consent.</p>
          <p className="text-sm leading-6 text-gray-700">The Company may assign or novate this Agreement within its corporate group or in connection with a merger or acquisition.</p>
        </div>

        {/* 15. Force Majeure */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          15. Force Majeure
        </h2>
        <p className="text-sm leading-6 text-gray-700 mb-12">The Company is not liable for delays caused by events beyond reasonable control.</p>

        {/* 16. Governing Law */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          16. Governing Law
        </h2>
        <div className="space-y-2 mb-12">
          <p className="text-sm leading-6 text-gray-700">This Agreement shall be governed by the laws of the State of California, without regard to conflict-of-laws principles.</p>
          <p className="text-sm leading-6 text-gray-700">The parties submit to the non-exclusive jurisdiction of California courts.</p>
        </div>

        {/* 17. General Provisions */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          17. General Provisions
        </h2>
        <ul className="text-sm leading-6 text-gray-700 ml-6 list-disc space-y-2 mb-12">
          <li>No partnership or agency relationship is created.</li>
          <li>Failure to enforce any provision is not a waiver.</li>
          <li>If any provision is invalid, remaining provisions remain enforceable.</li>
          <li>This Agreement constitutes the entire agreement between the parties.</li>
        </ul>

        {/* 18. Audit Rights */}
        <h2 className="font-semibold mt-12 mb-4 text-base text-gray-900 border-b border-gray-300 pb-2">
          18. Audit Rights
        </h2>
        <p className="text-sm leading-6 text-gray-700 mb-12">The Company may, upon thirty (30) days' written notice, audit the End-User's compliance with this Agreement during normal business hours.</p>

        {/* Copyright Footer */}
        <div className="text-sm text-gray-600 mt-16 pt-8 border-t border-gray-200">
          <p className="font-semibold mb-2">
            © 2025-{currentYear} NirvanaSoftTech Inc. All rights reserved.
          </p>
          <p className="text-xs leading-relaxed">
            This computer program is protected by copyright law and international treaties. Unauthorized reproduction or 
            distribution of this program, or any portion of it, may result in severe civil and criminal penalties, and will 
            be prosecuted to the maximum extent possible under the law.
          </p>
        </div>

      </div>
    </div>
  );
}
