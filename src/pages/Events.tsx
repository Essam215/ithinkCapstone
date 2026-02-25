import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Calendar, MapPin, Users, Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { getEvents, getEventById, applyToEvent } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import type { Event } from "../types";

export const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      const status = filter === "all" ? undefined : filter;
      const eventsData = await getEvents(status);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleEventClick = async (event: Event) => {
    try {
      const eventData = await getEventById(event.id);
      setSelectedEvent(eventData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading event:", error);
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleApply = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      await applyToEvent(parseInt(selectedEvent.id));
      alert("Event application submitted successfully!");
      setIsModalOpen(false);
      loadEvents();
    } catch (error: any) {
      console.error("Error applying to event:", error);
      alert(error.response?.data?.message || "Failed to apply to event");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === "all" || event.status === filter;
    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Events
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and apply to upcoming events
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filter events by status"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No events found
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover onClick={() => handleEventClick(event)}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.event_date || event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.current_participants || event.currentParticipants}/{event.max_participants || event.maxParticipants}{" "}
                        participants
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                      {event.points} points
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        event.status === "upcoming"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : event.status === "ongoing"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?.title}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedEvent.event_date || selectedEvent.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.location}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Participants
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.current_participants || selectedEvent.currentParticipants}/
                  {selectedEvent.max_participants || selectedEvent.maxParticipants}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Points
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.points}
                </p>
              </div>
            </div>

            {/* Show application status if exists */}
            {selectedEvent.application && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Application
                </h3>
                <div className="flex items-center gap-2">
                  {selectedEvent.application.status === 'approved' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Approved</span>
                    </>
                  ) : selectedEvent.application.status === 'rejected' ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300 font-medium">Rejected</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Apply button (only for students/php and if not applied or rejected) */}
            {(user?.role === 'student' || user?.role === 'php') && 
             (!selectedEvent.application || selectedEvent.application.status === 'rejected') && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleApply}
                disabled={
                    loading ||
                    (selectedEvent.current_participants || selectedEvent.currentParticipants) >=
                    (selectedEvent.max_participants || selectedEvent.maxParticipants)
                }
              >
                  {(selectedEvent.current_participants || selectedEvent.currentParticipants) >=
                  (selectedEvent.max_participants || selectedEvent.maxParticipants)
                  ? "Event Full"
                    : loading
                    ? "Applying..."
                  : "Apply to Event"}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
            )}

            {/* Close button if no apply button */}
            {((user?.role !== 'student' && user?.role !== 'php') || 
              (selectedEvent.application && selectedEvent.application.status !== 'rejected')) && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
