import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Clock, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#20131e] dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Hero Section */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBRxsyDAU1S_zjzJ1ukkMMsnYkpPQZIILgb0Vf6tRqJ04GfbH5bA2-ZTtPBEpApolPkWWIy58YqTvtHtdrYhir7gm8W9232rbm7Np7vaXE-XN-xwwmOZCbMHBk1Yi07PkBVFtyNc4Ur0DC1vWfMfW736PWZxO2TZPzEPnYEVzOK6D4T26dF5GPLz_JNlimiz7sAsOg7-3zyMmDba1IEmy29gZt3bUokgOWv78MRR3eQrdgI3IDHQtW7TZjkdw0GiRZth-XcdrmMHxo")'
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Secure Your Digital Legacy
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Ensure your crypto assets are securely transferred to your loved ones with our Solana-based platform. Set time-based conditions and rest assured your legacy
                      is protected.
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
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Secure Inheritance</h2>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">Utilize Solana's smart contracts for secure and transparent asset transfer.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#5f3a59] bg-[#2f1d2d] p-4 flex-col">
                  <div className="text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Multiple Heirs</h2>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">Designate multiple beneficiaries to receive your crypto assets.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#5f3a59] bg-[#2f1d2d] p-4 flex-col">
                  <div className="text-white">
                    <Clock className="w-6 h-6" />
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
                      backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWP13KAvTO9M7zzt0cHXgzwtJ2jRfaWzVdgE-fUV0rewtq-oEiHZK6m9AMlLw7GgYdCXMNGdpW7O0r3w_1xeVczcygeJRaLf1U6qt_e-W8H_HELutP1N1v6wfDxKdzHDSKDoyLGYTtnc7H4lqy0-Gvp6Qnm-j1NnsGf8MgEBPJZxOLAv8jNqR_vRdDxFRSUQXg5zYO6j8JVMWpwNpe5Kh9TjzLYCGWZxjsSif44d86EsIVneQ2tbvufR5iUpmcm31FYd6jk6l7OzM")'
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-base font-medium leading-normal">Olivia Carter</p>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">2 months ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#bb2ea6] fill-current" />
                  ))}
                </div>
                <p className="text-white text-base font-normal leading-normal">
                  I was looking for a secure way to pass on my crypto assets, and this platform exceeded my expectations. The process was straightforward, and I feel confident my
                  legacy is in good hands.
                </p>
                <div className="flex gap-9 text-[#c19abb]">
                  <button className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    <p className="text-inherit">12</p>
                  </button>
                  <button className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5" />
                    <p className="text-inherit">2</p>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 bg-[#20131e]">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyga3I-aGpO4wZ7dc2CzzYt1-HCHRB86a5-dU-vdvqNhrL3tBOyOkG33iFn1KRskRz12bSGv0n56QDZsk-u91AOTpYWhJew_iqoNFyvKwflqx8bc_P0uggRVFYtYZx8EN_5WzRJ-Dgec8qe8qhbv9ukp5oTDuOcVliBCXzFwJLrJ_wYd9GzTWPQlavYIF7JkW4Rq_LAnqZIcVvMbiWeR_2SE4gFsP6zCHJCMfaGqF1Lv8WXKCRUogIrbloL2PtRv9fNkto3k3pP98")'
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-base font-medium leading-normal">Owen Reynolds</p>
                    <p className="text-[#c19abb] text-sm font-normal leading-normal">3 months ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#bb2ea6] fill-current" />
                  ))}
                </div>
                <p className="text-white text-base font-normal leading-normal">
                  The ability to set time-based conditions gave me peace of mind. Knowing my assets will be transferred securely and at the right time is invaluable.
                </p>
                <div className="flex gap-9 text-[#c19abb]">
                  <button className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5" />
                    <p className="text-inherit">15</p>
                  </button>
                  <button className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5" />
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
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors" href="#">Privacy Policy</a>
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors" href="#">Terms of Service</a>
                <a className="text-[#c19abb] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors" href="#">Contact Us</a>
              </div>
              <p className="text-[#c19abb] text-base font-normal leading-normal">© 2024 Crypto Legacy. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
