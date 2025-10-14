# Addition PWA

A Progressive Web Application (PWA) for mathematical calculations, built with Python backend and standard web technologies for the frontend.

## 🏗️ Project Structure

```text
Addition/
├── frontend/                 # Frontend PWA files
│   ├── index.html           # Main HTML file
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker for offline functionality
│   ├── css/
│   │   └── main.css        # Main stylesheet
│   ├── js/
│   │   ├── main.js         # Main application logic
│   │   └── api.js          # API communication
│   ├── images/             # App images
│   └── icons/              # PWA icons (various sizes needed)
├── backend/                 # Python backend
│   ├── app.py              # Main Flask application
│   ├── api/
│   │   └── routes.py       # API endpoints
│   ├── models/
│   │   ├── calculator.py   # Calculator logic
│   │   └── history.py      # Calculation history management
│   ├── utils/
│   │   └── validators.py   # Input validation utilities
│   ├── config/
│   │   └── settings.py     # Application configuration
│   └── data/               # Data storage directory
├── static/                  # Static files served by Python
├── requirements.txt         # Python dependencies
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- A modern web browser that supports PWAs

### Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd "c:\Users\Rick\OneDrive\Programming\Addition"
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**

   ```bash
   cd backend
   python app.py
   ```

5. **Open your browser and navigate to:**

   ```text
   http://localhost:5000
   ```

## 📱 PWA Features

- **Offline Functionality**: Works without internet connection
- **Installable**: Can be installed on mobile devices and desktop
- **Responsive Design**: Adapts to different screen sizes
- **App-like Experience**: Feels like a native application

## 🔧 Development

### Backend Development

The Python backend uses Flask and provides:

- RESTful API endpoints for calculations
- Calculation history storage
- Input validation and error handling
- CORS support for frontend communication

Key files:

- `backend/app.py`: Main Flask application
- `backend/api/routes.py`: API endpoint definitions
- `backend/models/calculator.py`: Mathematical operations
- `backend/models/history.py`: History management

### Frontend Development

The frontend is a standard PWA using:

- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for functionality
- Service Worker for offline capabilities

Key files:

- `frontend/index.html`: Main application page
- `frontend/js/main.js`: Application logic
- `frontend/js/api.js`: Backend communication
- `frontend/sw.js`: Service worker
- `frontend/manifest.json`: PWA configuration

## 📋 API Endpoints

- `POST /api/v1/calculate` - Perform calculations
- `GET /api/v1/history` - Get calculation history
- `POST /api/v1/history` - Save calculation
- `DELETE /api/v1/history/<id>` - Delete calculation
- `GET /api/v1/health` - Health check

## 🛠️ Customization

### Adding New Operations

1. Update `backend/models/calculator.py` with new operation
2. Update validation in `backend/utils/validators.py`
3. Add frontend interface in `frontend/js/main.js`

### Styling

- Modify `frontend/css/main.css` for appearance changes
- Update `frontend/manifest.json` for PWA settings

### Icons

Add PWA icons in various sizes to `frontend/icons/`:

- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## 🔒 Security

- Input validation on both frontend and backend
- CORS configuration for cross-origin requests
- Sanitization of user inputs
- Error handling to prevent information disclosure

## 📊 Data Storage

- Calculation history stored in JSON files
- Located in `backend/data/` directory
- Configurable storage location and cleanup policies

## 🚀 Deployment

### Development

```bash
cd backend
python app.py
```

### Production

Consider using:

- **Gunicorn** for WSGI server
- **Nginx** for reverse proxy
- **Docker** for containerization
- **HTTPS** for secure connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Add your preferred license here.

## 🆘 Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're in the correct directory and virtual environment is activated
2. **Port conflicts**: Change the port in `backend/app.py` if 5000 is in use
3. **PWA not installing**: Check that you're serving over HTTPS or localhost
4. **API errors**: Check browser console and Python logs for detailed error messages

### Getting Help

- Check the browser console for JavaScript errors
- Review Python logs for backend issues
- Ensure all dependencies are properly installed
- Verify file permissions for the data directory
