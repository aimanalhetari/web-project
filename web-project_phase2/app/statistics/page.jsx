// app/statistics/page.jsx

import "../../public/css/statistics.css";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import BackLink from "./BackLink"; // Adjust path if necessary



export const metadata = {
  title: 'Statistics | Student Management System',
  description: 'View student and course statistics',
};

// Helper function to determine card color based on statistic title
function getCardClass(title) {
  if (title.includes('Student')) return 'student-card';
  if (title.includes('Course')) return 'course-card';
  if (title.includes('Instructor')) return 'instructor-card';
  if (title.includes('GPA')) return 'gpa-card';
  if (title.includes('Rate') || title.includes('Failure')) return 'rate-card';
  if (title.includes('Progress')) return 'progress-card';
  if (title.includes('Validated')) return 'validated-card';
  if (title.includes('Non-Validated')) return 'non-validated-card';
  if (title.includes('Average')) return 'average-card';
  if (title.includes('Top')) return 'top-card';
  if (title.includes('Graduation')) return 'graduation-card';
  return '';  // Default, no additional class
}

// Helper function to get the icon for a statistic
function getIcon(title) {
  if (title.includes('Student')) return '👨‍🎓';
  if (title.includes('Course')) return '📚';
  if (title.includes('Instructor')) return '👩‍🏫';
  if (title.includes('GPA')) return '🎓';
  if (title.includes('Rate') || title.includes('Failure')) return '📉';
  if (title.includes('Progress')) return '⏳';
  if (title.includes('Validated')) return '✅';
  if (title.includes('Non-Validated')) return '⏱️';
  if (title.includes('Average')) return '📊';
  if (title.includes('Top')) return '🏆';
  if (title.includes('Graduation')) return '🎯';
  return '📌';  // Default icon
}

// Helper function to check if the value contains a list that should be rendered as <ul>
function isList(title, value) {
  // Special case - we want Failure Rate to be a regular value, not a list
  if (title === "Failure Rate (%)" || title.includes("Average") || 
      title.includes("Instructor with") || title === "Most Popular In-Progress Course") {
    return false;
  }
  
  // If the value is a string containing commas and names/items, it's likely a list
  return typeof value === 'string' && 
         (value.includes(', ') || 
          (value.includes('(') && value.includes(')')));
}

// Helper function to convert a comma-separated list into array items
function formatListItems(value) {
  if (!value || typeof value !== 'string') return [];
  
  // For items with parentheses like "Sara Ahmed (3.90)" or "Programming Concepts (0.00%)"
  if (value.includes('(') && value.includes(')')) {
    // Split by comma when not inside parentheses
    return value.split('), ')
      .map(item => item.endsWith(')') ? item : item + ')');
  }
  
  // Simple comma-separated list
  return value.split(', ');
}

export default async function StatisticsPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin");
  }



  // Fetch statistics on the server using the API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/statistics`, {
    cache: "no-store",
  });



  if (!res.ok) {
    throw new Error("Failed to fetch statistics");
  }

  let { data: stats } = await res.json();
  
  return (
    <main className="statistics-container">
      <BackLink />
      <div className="statistics-header">
        <div className="icon-container">
          <span className="dashboard-icon">📊</span>
        </div>
        <h1>Student Statistics Dashboard</h1>
      </div>
      
      <div className="stat-list">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${getCardClass(stat.title)}`}>
            <div className="stat-icon">{getIcon(stat.title)}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              {isList(stat.title, stat.value) ? (
                <ul className="stat-value-list">
                  {formatListItems(stat.value).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="stat-value">{stat.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}