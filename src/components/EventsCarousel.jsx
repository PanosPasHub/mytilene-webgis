import React from "react";

export function EventsCarousel({ events, onSelect }) {
  return (
    <div id="events" className="w-[90%] mx-auto bg-white rounded-xl shadow-md p-6">
      <h3 className="text-2xl font-bold mb-4">Τρέχοντα Events</h3>
      <div className="flex gap-4 overflow-x-auto">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="min-w-[250px] bg-gray-100 rounded-lg p-4 hover:bg-cyan-100 transition cursor-pointer"
            onClick={() => onSelect(event)} // Προσθήκη click handler
          >
            <img 
              src={event.image} 
              alt={event.title} 
              className="h-40 w-full object-cover rounded-md mb-2" 
            />
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}