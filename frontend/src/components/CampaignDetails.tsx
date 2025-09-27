"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Eye,
  Share2,
  Calendar,
  Hash,
  Award,
  MessageCircle,
  ExternalLink,
  Camera,
  Loader2,
  TrendingUp,
  Shield,
  Verified,
} from "lucide-react";

// Types
interface Campaign {
  id: string;
  title: string;
  description: string;
  brand: {
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    totalCampaigns: number;
    contact: string;
  };
  status: "active" | "completed" | "paused" | "draft";
  deadline: Date;
  paymentPerPost: number;
  maxPosts: number;
  submittedPosts: number;
  verifiedPosts: number;
  requirements: {
    content: string;
    hashtags: string[];
    minFollowers: number;
    specialInstructions?: string;
  };
  createdAt: Date;
}

interface Submission {
  id: string;
  creator: {
    name: string;
    avatar: string;
    followers: number;
    verified: boolean;
  };
  postUrl: string;
  submittedAt: Date;
  status: "pending" | "verified" | "rejected";
  paymentAmount: number;
  verificationDetails?: string;
}

interface User {
  role: "brand" | "creator";
  address: string;
  isConnected: boolean;
}

const CampaignDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [user, setUser] = useState<User>({
    role: "creator",
    address: "",
    isConnected: false,
  });
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCampaign: Campaign = {
      id: (params?.id as string) || "1",
      title: "Summer Fashion Collection 2025",
      description:
        "Showcase our latest summer collection featuring sustainable fashion and eco-friendly materials. Looking for authentic content that resonates with environmentally conscious audiences.",
      brand: {
        name: "EcoStyle",
        avatar: "/api/placeholder/64/64",
        verified: true,
        rating: 4.8,
        totalCampaigns: 24,
        contact: "partnerships@ecostyle.com",
      },
      status: "active",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paymentPerPost: 250,
      maxPosts: 50,
      submittedPosts: 32,
      verifiedPosts: 28,
      requirements: {
        content:
          "Create authentic content featuring our summer collection. Include lifestyle shots, product highlights, and personal styling tips. Content should feel natural and engaging.",
        hashtags: [
          "SustainableFashion",
          "EcoStyle",
          "SummerVibes",
          "EthicalFashion",
        ],
        minFollowers: 10000,
        specialInstructions:
          "Please tag our official account and use natural lighting for all photos.",
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };

    const mockSubmissions: Submission[] = [
      {
        id: "1",
        creator: {
          name: "Sarah Johnson",
          avatar: "/api/placeholder/40/40",
          followers: 45000,
          verified: true,
        },
        postUrl: "https://instagram.com/p/example1",
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "verified",
        paymentAmount: 250,
        verificationDetails:
          "All requirements met. Great engagement and authentic content.",
      },
      {
        id: "2",
        creator: {
          name: "Mike Chen",
          avatar: "/api/placeholder/40/40",
          followers: 23000,
          verified: false,
        },
        postUrl: "https://instagram.com/p/example2",
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: "pending",
        paymentAmount: 250,
      },
      {
        id: "3",
        creator: {
          name: "Emma Davis",
          avatar: "/api/placeholder/40/40",
          followers: 67000,
          verified: true,
        },
        postUrl: "https://instagram.com/p/example3",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "rejected",
        paymentAmount: 0,
        verificationDetails: "Missing required hashtags and brand mention.",
      },
    ];

    setTimeout(() => {
      setCampaign(mockCampaign);
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, [params?.id]);

  // Countdown timer
  useEffect(() => {
    if (!campaign) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = campaign.deadline.getTime();
      const distance = deadline - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft("Expired");
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [campaign]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      case "completed":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      case "paused":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "verified":
        return "text-green-400 border-green-400/30 bg-green-400/10";
      case "pending":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "rejected":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      default:
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const handleAcceptCampaign = () => {
    setIsAccepted(true);
    // TODO: Implement smart contract interaction
  };

  const handleSubmitPost = () => {
    router.push(`/creator/submit/${campaign?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 flex items-center gap-3">
          <Loader2 className="animate-spin text-purple-400" size={24} />
          <span className="text-white">Loading campaign details...</span>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <p className="text-white/70">
            The campaign you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Campaigns
        </button>

        {/* Campaign Header */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {campaign.title}
                </h1>
                <div
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                </div>
              </div>

              <div className="flex items-center gap-6 text-white/70">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Ends in {timeLeft}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>
                    {campaign.submittedPosts}/{campaign.maxPosts} posts
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">
                ${campaign.paymentPerPost} PYUSD
              </div>
              <div className="text-white/70 text-sm">per verified post</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>Campaign Progress</span>
              <span>
                {Math.round(
                  (campaign.submittedPosts / campaign.maxPosts) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (campaign.submittedPosts / campaign.maxPosts) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target size={20} className="text-purple-400" />
            Campaign Requirements
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-2">
                Content Guidelines
              </h3>
              <p className="text-white/80 leading-relaxed">
                {campaign.requirements.content}
              </p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Required Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.requirements.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg text-sm text-purple-300"
                  >
                    <Hash size={12} />
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-medium mb-2">
                  Minimum Followers
                </h3>
                <div className="flex items-center gap-2 text-white/80">
                  <Users size={16} />
                  <span>
                    {campaign.requirements.minFollowers.toLocaleString()}+
                  </span>
                </div>
              </div>

              {campaign.requirements.specialInstructions && (
                <div>
                  <h3 className="text-white font-medium mb-2">
                    Special Instructions
                  </h3>
                  <p className="text-white/80 text-sm">
                    {campaign.requirements.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            Brand Information
          </h2>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {campaign.brand.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {campaign.brand.name}
                </h3>
                {campaign.brand.verified && (
                  <Verified size={16} className="text-blue-400" />
                )}
              </div>

              <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400" />
                  <span>{campaign.brand.rating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={14} />
                  <span>{campaign.brand.totalCampaigns} campaigns</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/70">
                <MessageCircle size={14} />
                <span>{campaign.brand.contact}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section - Role Based */}
        {user.role === "creator" && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
            <div className="text-center">
              {!isAccepted ? (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Ready to join this campaign?
                  </h3>
                  <p className="text-white/70 mb-6">
                    Accept this campaign to start creating content and earning
                    PYUSD payments.
                  </p>
                  <button
                    onClick={handleAcceptCampaign}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                  >
                    <CheckCircle size={20} />
                    Accept Campaign
                  </button>
                </div>
              ) : !hasSubmitted ? (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Campaign Accepted!
                  </h3>
                  <p className="text-white/70 mb-6">
                    You're now part of this campaign. Create your content and
                    submit it for AI verification.
                  </p>
                  <button
                    onClick={handleSubmitPost}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                  >
                    <Camera size={20} />
                    Submit Post
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Post Submitted!
                  </h3>
                  <p className="text-white/70 mb-6">
                    Your content is being verified by AI agents. You'll receive
                    payment automatically upon approval.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg text-yellow-300">
                    <Clock size={16} />
                    Verification in progress...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brand Management Actions */}
        {user.role === "brand" && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Campaign Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300">
                <Eye size={20} className="text-blue-400" />
                <span className="text-white">View Analytics</span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300">
                <Share2 size={20} className="text-green-400" />
                <span className="text-white">Share Campaign</span>
              </button>

              <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300">
                <TrendingUp size={20} className="text-purple-400" />
                <span className="text-white">Boost Campaign</span>
              </button>
            </div>
          </div>
        )}

        {/* Submissions Overview - Brand Only */}
        {user.role === "brand" && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Recent Submissions
            </h2>

            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {submission.creator.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {submission.creator.name}
                        </span>
                        {submission.creator.verified && (
                          <Verified size={14} className="text-blue-400" />
                        )}
                      </div>
                      <div className="text-white/70 text-sm">
                        {submission.creator.followers.toLocaleString()}{" "}
                        followers
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {getStatusIcon(submission.status)}
                      {submission.status.charAt(0).toUpperCase() +
                        submission.status.slice(1)}
                    </div>

                    <button className="text-white/70 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {submissions.length === 0 && (
              <div className="text-center py-12 text-white/70">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p>No submissions yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
