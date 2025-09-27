"use client";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Bot,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Verification",
      description:
        "Automated content verification using ASI Alliance agents. No manual reviews, instant approval for compliant posts.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: Zap,
      title: "Instant PYUSD Payments",
      description:
        "Automated payments in PYUSD upon verification. No delays, no disputes, just instant value transfer.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Decentralized Trust",
      description:
        "Smart contracts eliminate intermediaries. Transparent, trustless transactions on the blockchain.",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const stats = [
    { label: "AI Verification Time", value: "< 30s" },
    { label: "Platform Fee", value: "2.5%" },
    { label: "Payment Delay", value: "0 mins" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background gradient and texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">AdLoom</span>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-1">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-20 lg:py-32">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/90 font-medium">
                  Live on Sepolia Testnet
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Trustless{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Creator-Brand
                </span>{" "}
                Connections
              </h1>

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto">
                The first decentralized influencer platform powered by{" "}
                <span className="text-purple-300 font-semibold">
                  AI verification
                </span>{" "}
                and{" "}
                <span className="text-blue-300 font-semibold">
                  instant PYUSD payments
                </span>
                . No intermediaries, no delays, just pure trustless
                collaboration.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-2xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl p-1">
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openAccountModal,
                      openChainModal,
                      openConnectModal,
                      mounted,
                    }) => {
                      const ready = mounted;
                      const connected = ready && account && chain;

                      return (
                        <div
                          {...(!ready && {
                            "aria-hidden": true,
                            style: {
                              opacity: 0,
                              pointerEvents: "none",
                              userSelect: "none",
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 text-lg shadow-lg hover:shadow-purple-500/25"
                                >
                                  Connect Wallet & Start Building
                                  <ArrowRight size={20} />
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() =>
                                  (window.location.href = "/register")
                                }
                                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 text-lg shadow-lg hover:shadow-purple-500/25"
                              >
                                Enter Platform
                                <ArrowRight size={20} />
                              </button>
                            );
                          })()}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Built for the Future of Creator Economy
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Combining cutting-edge AI with blockchain technology to create
                the most efficient creator-brand marketplace.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon size={28} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>

                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CheckCircle size={20} className="text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Simple. Transparent. Automated.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {/* Brand Flow */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white font-bold">B</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    For Brands
                  </h3>
                  <p className="text-white/70">
                    Launch campaigns with confidence
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">
                      1
                    </div>
                    <span className="text-white/90">
                      Create campaign & lock PYUSD budget
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">
                      2
                    </div>
                    <span className="text-white/90">
                      AI agents verify creator submissions
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold">
                      3
                    </div>
                    <span className="text-white/90">
                      Automatic payment on verification
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Flow */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white font-bold">C</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    For Creators
                  </h3>
                  <p className="text-white/70">
                    Get paid instantly for great content
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-sm font-bold">
                      1
                    </div>
                    <span className="text-white/90">
                      Browse & accept campaign offers
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-sm font-bold">
                      2
                    </div>
                    <span className="text-white/90">
                      Create content & submit post URL
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-sm font-bold">
                      3
                    </div>
                    <span className="text-white/90">
                      Receive PYUSD payment instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-white">AdLoom</span>
              </div>

              <p className="text-white/70 mb-4">
                Built for ETHDelhi 2025 Hackathon
              </p>

              <div className="flex items-center justify-center gap-8 text-sm text-white/60">
                <span>🤖 Powered by ASI Alliance</span>
                <span>💰 Payments by PayPal PYUSD</span>
                <span>⛓️ Built on Ethereum</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
