import ScrollHeader from "./components/ScrollHeader"

function App() {
  return (
    <div className="min-h-screen">
      <ScrollHeader />

      {/* Demo content to show the scroll behavior */}
      <div className="pt-0">
        {/* Hero Section */}
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #023080 0%, #04307b 50%, #8e9fc5 100%)",
          }}
        >
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">SWIS Foundation</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Social Welfare & Impact Solutions</p>
            <button
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "#FCFDFF",
                color: "#023080",
              }}
            >
              Get Involved
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-20" style={{ backgroundColor: "#FCFDFF" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6" style={{ color: "#023080" }}>
                Our Impact Areas
              </h2>
              <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: "#8e9fc5" }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Education",
                  description:
                    "Empowering communities through quality education and skill development programs that create lasting change.",
                  icon: "📚",
                },
                {
                  title: "Healthcare",
                  description:
                    "Providing accessible healthcare solutions to underserved populations with comprehensive medical care.",
                  icon: "🏥",
                },
                {
                  title: "Nutrition",
                  description:
                    "Fighting hunger and malnutrition through sustainable food programs and community kitchens.",
                  icon: "🍎",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: "white" }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: "#04307b" }}>
                    {item.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#8e9fc5" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SWIS Institute Section */}
        <div className="py-20" style={{ backgroundColor: "#d2d5e0" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6" style={{ color: "#023080" }}>
                SWIS Institute
              </h2>
              <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: "#8e9fc5" }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Centre for Social Impact & Innovation",
                  description:
                    "Innovation hub for social change, developing cutting-edge solutions for community challenges.",
                  icon: "💡",
                },
                {
                  title: "Centre for Social Awareness & Action",
                  description:
                    "Community engagement and awareness programs that mobilize citizens for positive social action.",
                  icon: "🤝",
                },
                {
                  title: "Centre for Civil Administration & Engagement",
                  description:
                    "Governance and civic programs that strengthen democratic institutions and citizen participation.",
                  icon: "🏛️",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: "white" }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: "#04307b" }}>
                    {item.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#8e9fc5" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-20" style={{ backgroundColor: "#FCFDFF" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-8" style={{ color: "#023080" }}>
                Making a Difference Together
              </h2>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={{ color: "#04307b" }}>
                Join us in our mission to create positive social impact through innovative solutions, community
                engagement, and sustainable development programs that transform lives and build stronger communities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#023080",
                    color: "#FCFDFF",
                  }}
                >
                  Volunteer Now
                </button>
                <button
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 border-2"
                  style={{
                    backgroundColor: "transparent",
                    color: "#023080",
                    borderColor: "#023080",
                  }}
                >
                  Donate Today
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="h-96" style={{ backgroundColor: "#FCFDFF" }}></div>
      </div>
    </div>
  )
}

export default App
