"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface RebalanceEvent {
  id: string;
  user: string;
  delegate: string;
  totalValue: string;
  timestamp: number;
  swaps: number;
  bridges: number;
  status: "completed" | "pending" | "failed";
}

export const RebalancingHistory = () => {
  const { address } = useAccount();
  const [events, setEvents] = useState<RebalanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: RebalanceEvent[] = [
      {
        id: "0x123...",
        user: address || "0x000...",
        delegate: "0x456...",
        totalValue: "5000.00",
        timestamp: Date.now() - 3600000, // 1 hour ago
        swaps: 2,
        bridges: 1,
        status: "completed",
      },
      {
        id: "0x789...",
        user: address || "0x000...",
        delegate: "0x456...",
        totalValue: "4800.00",
        timestamp: Date.now() - 86400000, // 1 day ago
        swaps: 1,
        bridges: 0,
        status: "completed",
      },
      {
        id: "0xabc...",
        user: address || "0x000...",
        delegate: "0x456...",
        totalValue: "5200.00",
        timestamp: Date.now() - 172800000, // 2 days ago
        swaps: 3,
        bridges: 2,
        status: "completed",
      },
    ];
    
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, [address]);

  const filteredEvents = events.filter(event => 
    filter === "all" || event.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "badge-success";
      case "pending": return "badge-warning";
      case "failed": return "badge-error";
      default: return "badge-neutral";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg text-center">
          <p className="text-3xl font-bold text-primary">{events.length}</p>
          <p className="text-sm text-base-content/70">Total Rebalances</p>
        </div>
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg text-center">
          <p className="text-3xl font-bold text-success">
            {events.filter(e => e.status === "completed").length}
          </p>
          <p className="text-sm text-base-content/70">Successful</p>
        </div>
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg text-center">
          <p className="text-3xl font-bold text-warning">
            {events.filter(e => e.status === "pending").length}
          </p>
          <p className="text-sm text-base-content/70">Pending</p>
        </div>
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg text-center">
          <p className="text-3xl font-bold text-error">
            {events.filter(e => e.status === "failed").length}
          </p>
          <p className="text-sm text-base-content/70">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Rebalancing History</h3>
          <div className="flex space-x-2">
            {(["all", "completed", "pending", "failed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn btn-sm ${
                  filter === status ? "btn-primary" : "btn-outline"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/70">No rebalancing events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-4 bg-base-200 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="badge badge-lg">{getStatusColor(event.status)}</div>
                    <div>
                      <p className="font-medium">Rebalance #{event.id.slice(0, 8)}</p>
                      <p className="text-sm text-base-content/70">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${event.totalValue}</p>
                    <p className="text-sm text-base-content/70">
                      {event.swaps} swaps, {event.bridges} bridges
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Action ID</p>
                    <p className="font-mono text-xs">{event.id}</p>
                  </div>
                  <div>
                    <p className="font-medium">Delegate</p>
                    <p className="font-mono text-xs">
                      {event.delegate.slice(0, 6)}...{event.delegate.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Operations</p>
                    <p>{event.swaps + event.bridges} total</p>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="btn btn-outline btn-sm">
                    View Details
                  </button>
                  <button className="btn btn-outline btn-sm">
                    View on Explorer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Success Rate</h4>
            <div className="flex items-center space-x-2">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ 
                    width: `${(events.filter(e => e.status === "completed").length / events.length) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {events.length > 0 ? Math.round((events.filter(e => e.status === "completed").length / events.length) * 100) : 0}%
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Average Operations</h4>
            <p className="text-2xl font-bold text-primary">
              {events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.swaps + e.bridges, 0) / events.length) : 0}
            </p>
            <p className="text-sm text-base-content/70">per rebalance</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {events.slice(0, 5).map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.status === "completed" ? "bg-success" :
                  event.status === "pending" ? "bg-warning" : "bg-error"
                }`}></div>
                <div>
                  <p className="font-medium">Rebalance #{event.id.slice(0, 8)}</p>
                  <p className="text-sm text-base-content/70">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${event.totalValue}</p>
                <p className="text-sm text-base-content/70">
                  {event.swaps + event.bridges} ops
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
