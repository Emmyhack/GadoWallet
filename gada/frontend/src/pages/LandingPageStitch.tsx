import React from 'react';
import { Link } from 'react-router-dom';

const LandingPageStitch: React.FC = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#20131e] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Hero Section */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBRxsyDAU1S_zjzJ1ukkMMsnYkpPQZIILgb0Vf6tRqJ04GfbH5bA2-ZTtPBEpApolPkWWIy58YqTvtHtdrYhir7gm8W9232rbm7Np7vaXE-XN-xwwmOZCbMHBk1Yi07PkBVFtyNc4Ur0DC1vWfMfW736PWZxO2TZPzEPnYEVzOK6D4T26dF5GPLz_JNlimiz7sAsOg7-3zyMmDba1IEmy29gZt3bUokgOWv78MRR3eQrdgI3IDHQtW7TZjkdw0GiRZth-XcdrmMHxo")',
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Secure Your Digital Legacy
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Ensure your crypto assets are securely transferred to your loved ones with our Solana-based platform. Set time-based conditions and rest assured your legacy is protected.
                    </h2>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#bb2ea6] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#a91f8f] transition-colors"
                  >
                    <span className="truncate">Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
            {/* Features Section */}
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                  Key Features
                </h1>
                <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                  Our platform offers a range of features designed to provide security and flexibility in managing your digital inheritance.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#5f3a59] bg-[#2f1d2d] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,40H48A16,16,0,0,0,32,56v58.77c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56l160,0Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Secure Inheritance</h2>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">Utilize Solana's smart contracts for secure and transparent asset transfer.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#5f3a59] bg-[#2f1d2d] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Multiple Heirs</h2>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">Designate multiple beneficiaries to receive your crypto assets.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#5f3a59] bg-[#2f1d2d] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Time-Based Claims</h2>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">Set specific time conditions for when heirs can claim their inheritance.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* How It Works Section */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">How It Works</h2>
            <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
              <div className="flex flex-col items-center gap-1 pt-5">
                <div className="size-2 rounded-full bg-white"></div>
                <div className="w-[1.5px] bg-[#5f3a59] h-4 grow"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-white text-base font-medium leading-normal">Add Heirs</p>
                <p className="text-[#c19abb] text-base font-normal leading-normal">Easily add beneficiaries to your account.</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.5px] bg-[#5f3a59] h-4"></div>
                <div className="size-2 rounded-full bg-white"></div>
                <div className="w-[1.5px] bg-[#5f3a59] h-4 grow"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-white text-base font-medium leading-normal">Set Conditions</p>
                <p className="text-[#c19abb] text-base font-normal leading-normal">Define the conditions and timing for asset transfer.</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.5px] bg-[#5f3a59] h-4"></div>
                <div className="size-2 rounded-full bg-white"></div>
                <div className="w-[1.5px] bg-[#5f3a59] h-4 grow"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-white text-base font-medium leading-normal">Stay Active</p>
                <p className="text-[#c19abb] text-base font-normal leading-normal">Maintain account activity to keep your plan active.</p>
              </div>
              <div className="flex flex-col items-center gap-1 pb-3">
                <div className="w-[1.5px] bg-[#5f3a59] h-4"></div>
                <div className="size-2 rounded-full bg-white"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-white text-base font-medium leading-normal">Automatic Transfer</p>
                <p className="text-[#c19abb] text-base font-normal leading-normal">Assets are automatically transferred to heirs upon inactivity.</p>
              </div>
            </div>
            {/* Statistics Section */}
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#42293f]">
                <p className="text-white text-base font-medium leading-normal">Users</p>
                <p className="text-white tracking-light text-2xl font-bold leading-tight">1,500+</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#42293f]">
                <p className="text-white text-base font-medium leading-normal">Assets Secured</p>
                <p className="text-white tracking-light text-2xl font-bold leading-tight">$2.5M+</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#42293f]">
                <p className="text-white text-base font-medium leading-normal">Heirs Protected</p>
                <p className="text-white tracking-light text-2xl font-bold leading-tight">2,000+</p>
              </div>
            </div>
            {/* Testimonials Section */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Testimonials</h2>
            <div className="flex flex-col gap-8 overflow-x-hidden bg-[#20131e] p-4">
              <div className="flex flex-col gap-3 bg-[#20131e]">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWP13KAvTO9M7zzt0cHXgzwtJ2jRfaWzVdgE-fUV0rewtq-oEiHZK6m9AMlLw7GgYdCXMNGdpW7O0r3w_1xeVczcygeJRaLf1U6qt_e-W8H_HELutP1N1v6wfDxKdzHDSKDoyLGYTtnc7H4lqy0-Gvp6Qnm-j1NnsGf8MgEBPJZxOLAv8jNqR_vRdDxFRSUQXg5zYO6j8JVMWpwNpe5Kh9TjzLYCGWZxjsSif44d86EsIVneQ2tbvufR5iUpmcm31FYd6jk6l7OzM")',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-base font-medium leading-normal">Olivia Carter</p>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">2 months ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="text-[#bb2ea6]">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-white text-base font-normal leading-normal">
                  I was looking for a secure way to pass on my crypto assets, and this platform exceeded my expectations. The process was straightforward, and I feel confident my legacy is in good hands.
                </p>
                <div className="flex gap-9 text-[#c19abb]">
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
                    </svg>
                    <p className="text-inherit">12</p>
                  </button>
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
                    </svg>
                    <p className="text-inherit">2</p>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 bg-[#20131e]">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyga3I-aGpO4wZ7dc2CzzYt1-HCHRB86a5-dU-vdvqNhrL3tBOyOkG33iFn1KRskRz12bSGv0n56QDZsk-u91AOTpYWhJew_iqoNFyvKwflqx8bc_P0uggRVFYtYZx8EN_5WzRJ-Dgec8qe8qhbv9ukp5oTDuOcVliBCXzFwJLrJ_wYd9GzTWPQlavYIF7JkW4Rq_LAnqZIcVvMbiWeR_2SE4gFsP6zCHJCMfaGqF1Lv8WXKCRUogIrbloL2PtRv9fNkto3k3pP98")',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-base font-medium leading-normal">Owen Reynolds</p>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">3 months ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="text-[#bb2ea6]">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-white text-base font-normal leading-normal">
                  The ability to set time-based conditions gave me peace of mind. Knowing my assets will be transferred securely and at the right time is invaluable.
                </p>
                <div className="flex gap-9 text-[#c19abb]">
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
                    </svg>
                    <p className="text-inherit">15</p>
                  </button>
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
                    </svg>
                    <p className="text-inherit">1</p>
                  </button>
                </div>
              </div>
            </div>
            {/* Final CTA Section */}
            <div className="@container">
              <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                    Ready to Secure Your Digital Legacy?
                  </h1>
                  <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                    Join thousands of users who trust our platform to protect their crypto assets and ensure a smooth transfer to their loved ones.
                  </p>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex justify-center">
                    <Link
                      to="/dashboard"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#bb2ea6] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow hover:bg-[#a91f8f] transition-colors"
                    >
                      <span className="truncate">Get Started</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
              </div>
              <p className="text-[#c19abb] text-base font-normal leading-normal">© 2024 Crypto Legacy. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPageStitch; 