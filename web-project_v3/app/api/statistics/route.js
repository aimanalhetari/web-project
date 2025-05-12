import repo from "../../repo/StatisticsRepo";

export async function GET(request) {
  try{
    const statistics = await repo.getStatistics()
    return Response.json({ success: true, data: statistics });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

