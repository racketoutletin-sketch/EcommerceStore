const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 space-y-12">
        {/* Logo & Welcome */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">RacketOutlet</h2>
          <p className="text-gray-300">Welcome to the future of Sports.</p>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-2 rounded-md text-black w-full sm:w-1/3"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
            Subscribe
          </button>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div>
            <h3 className="font-semibold text-lg mb-2">POLICY</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Shipping Policy</li>
              <li>Return & Refund Policy</li>
              <li>About Us</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">SPORTS</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Badminton</li>
              <li>Cricket</li>
              <li>Tennis</li>
              <li>Squash</li>
              <li>Football</li>
              <li>Boxing</li>
            </ul>
            <h3 className="font-semibold text-lg mt-4 mb-2">NEWS</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Badminton</li>
              <li>Cricket</li>
              <li>Football</li>
              <li>Tennis</li>
              <li>Others</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">COMMUNITY & SUPPORT</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>Run90</li>
              <li>Insta360</li>
              <li>Product360</li>
              <li>Creed Fight Nights</li>
              <li>The Gorilla Trail Duathlon</li>
            </ul>
            <h3 className="font-semibold text-lg mt-4 mb-2">MAILING ADDRESS</h3>
            <p className="text-gray-300 text-sm">
              Bitsport Private Limited <br />
              25/1A, 1st Cross Rd, near Wipro Office, Halanayakanahalli, Bengaluru, Karnataka 560035
            </p>
            <h3 className="font-semibold text-lg mt-4 mb-2">SUPPORT</h3>
            <p className="text-gray-300 text-sm">
              Track Your Order <br />
              General Queries: 9164412977 <br />
              Order Support: 9108872097 <br />
              10 AM to 6 PM (Monday to Saturday)
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm mt-8">
          &copy; 2025 RacketOutlet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
