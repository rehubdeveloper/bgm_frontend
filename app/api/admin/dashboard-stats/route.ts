import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Check for authorization header (required for admin content)
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        // Common headers for authenticated requests
        const authHeaders = {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        };

        // Fetch all required data in parallel using the correct API endpoints
        const [
            membersResponse,
            testimoniesResponse,
            eventsResponse,
            sermonsResponse,
            devotionalsResponse,
            departmentsResponse
        ] = await Promise.all([
            // Use the correct endpoints that exist in the frontend API
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/members/`, { headers: authHeaders }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/testimonies/`, { headers: authHeaders }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/events/`, { headers: authHeaders }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/sermons/`, { headers: authHeaders }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-panel/devotionals/`, { headers: authHeaders }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/`, { headers: authHeaders })
        ]);

        // Parse responses
        const membersData = membersResponse.ok ? await membersResponse.json() : [];
        const testimoniesData = testimoniesResponse.ok ? await testimoniesResponse.json() : [];
        const eventsData = eventsResponse.ok ? await eventsResponse.json() : [];
        const sermonsData = sermonsResponse.ok ? await sermonsResponse.json() : [];
        const devotionalsData = devotionalsResponse.ok ? await devotionalsResponse.json() : [];
        const departmentsData = departmentsResponse.ok ? await departmentsResponse.json() : [];

        // Helper function to get array from response (handles both direct arrays and paginated responses)
        const getArrayFromResponse = (data: any): any[] => {
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.results)) return data.results;
            return [];
        };

        // Get arrays from responses
        const membersArray = getArrayFromResponse(membersData);
        const testimoniesArray = getArrayFromResponse(testimoniesData);
        const eventsArray = getArrayFromResponse(eventsData);
        const sermonsArray = getArrayFromResponse(sermonsData);
        const devotionalsArray = getArrayFromResponse(devotionalsData);
        const departmentsArray = getArrayFromResponse(departmentsData);

        // Calculate statistics
        const totalMembers = membersArray.length;

        // Count pending testimonies - check for various status values that might indicate pending
        const pendingStatuses = ['pending', 'submitted', 'draft', 'new', 'waiting', 'review'];
        const pendingTestimonies = testimoniesArray.filter((testimony: any) => {
            const status = testimony.status?.toLowerCase();
            return pendingStatuses.includes(status) ||
                   !testimony.status || // If no status field, assume pending
                   status === 'pending' ||
                   status === 'submitted';
        }).length;

        // Count active/upcoming events
        const now = new Date();
        const activeEvents = eventsArray.filter((event: any) => {
            const eventDate = new Date(event.event_date);
            return eventDate >= now;
        }).length;

        // Recent members (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentMembers = membersArray.filter((member: any) => {
            const createdDate = new Date(member.created_at);
            return createdDate >= thirtyDaysAgo;
        }).length;

        // Recent content (last 30 days)
        const recentSermons = sermonsArray.filter((sermon: any) => {
            const createdDate = new Date(sermon.created_at || sermon.upload_date);
            return createdDate >= thirtyDaysAgo;
        }).length;

        const recentDevotionals = devotionalsArray.filter((devotional: any) => {
            const createdDate = new Date(devotional.created_at || devotional.publish_date);
            return createdDate >= thirtyDaysAgo;
        }).length;

        const totalDepartments = departmentsArray.length;

        // Calculate growth percentages (simplified - you might want to compare with previous period)
        const memberGrowth = recentMembers > 0 ? `+${recentMembers} this month` : 'No new members';

        const dashboardStats = {
            totalMembers: {
                count: totalMembers,
                label: 'Total Members',
                change: memberGrowth
            },
            pendingTestimonies: {
                count: pendingTestimonies,
                label: 'Pending Testimonies',
                change: pendingTestimonies > 0 ? 'Awaiting review' : 'All reviewed'
            },
            activeEvents: {
                count: activeEvents,
                label: 'Active Events',
                change: `${activeEvents} upcoming`
            },
            recentContent: {
                count: recentSermons + recentDevotionals,
                label: 'Recent Content',
                change: `${recentSermons} sermons, ${recentDevotionals} devotionals`
            },
            totalDepartments: {
                count: totalDepartments,
                label: 'Departments',
                change: 'Church departments'
            },
            // Additional detailed stats
            detailedStats: {
                totalSermons: sermonsArray.length,
                totalDevotionals: devotionalsArray.length,
                totalTestimonies: testimoniesArray.length,
                recentMembersCount: recentMembers,
                recentSermonsCount: recentSermons,
                recentDevotionalsCount: recentDevotionals
            }
        };

        return NextResponse.json(dashboardStats);

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
