import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrganizerCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        city: '',
        price: 0,
        totalSeats: 100,
        imageUrl: '',
        category: 'musical',
        subCategory: '',
        maxTicketsPerPurchase: 4
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Authentication required. Please sign in as organizer.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    totalSeats: Number(form.totalSeats),
                    maxTicketsPerPurchase: Number(form.maxTicketsPerPurchase)
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create event');

            alert('Event created successfully');
            navigate('/organizer-dashboard');
        } catch (err) {
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="organizer-create-page">
            <div className="organizer-create-card">
                <div className="organizer-create-header">
                    <p className="organizer-create-tag">Organizer space</p>
                    <h1>Create your event</h1>
                    <p className="organizer-create-subtitle">Add event details, choose category, and publish it for customers.</p>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="organizer-create-form">
                    <div className="form-grid">
                        <label className="form-field">
                            <span>Event name</span>
                            <input className="form-control" name="name" placeholder="Event name" value={form.name} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Category</span>
                            <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                                <option value="musical">Musical</option>
                                <option value="cinema">Cinema</option>
                                <option value="education">Education</option>
                            </select>
                        </label>

                        <label className="form-field">
                            <span>Subcategory</span>
                            <input className="form-control" name="subCategory" placeholder="e.g. Jazz" value={form.subCategory} onChange={handleChange} />
                        </label>

                        <label className="form-field">
                            <span>Date</span>
                            <input className="form-control" name="date" type="date" value={form.date} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Time</span>
                            <input className="form-control" name="time" type="time" value={form.time} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Venue</span>
                            <input className="form-control" name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>City</span>
                            <input className="form-control" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Price (MAD)</span>
                            <input className="form-control" name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Total seats</span>
                            <input className="form-control" name="totalSeats" type="number" min="1" placeholder="Total seats" value={form.totalSeats} onChange={handleChange} required />
                        </label>

                        <label className="form-field">
                            <span>Max tickets / purchase</span>
                            <input className="form-control" name="maxTicketsPerPurchase" type="number" min="1" placeholder="Max tickets per purchase" value={form.maxTicketsPerPurchase} onChange={handleChange} />
                        </label>

                        <label className="form-field form-field-full">
                            <span>Image URL</span>
                            <input className="form-control" name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
                        </label>
                    </div>

                    <label className="form-field form-field-full">
                        <span>Description</span>
                        <textarea className="form-control textarea-control" name="description" placeholder="Write a short event description" value={form.description} onChange={handleChange} />
                    </label>

                    <button type="submit" className="primary-button" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
                </form>
            </div>
        </div>
    );
};

export default OrganizerCreate;
