# Addition Game

An educational addition game featuring intelligent problem selection, adaptive learning, theme system, and DEV-GUIDELINES compliant development. Built with Python backend and standard web technologies for the frontend.

## 🏗️ Project Structure

```text
Addition/
├── frontend/                 # Frontend application files
│   ├── index-dev.html       # Development HTML file
│   ├── index.html           # Production HTML file
│   ├── dev-server.py        # Development server
│   ├── manifest.json        # PWA manifest
│   ├── sw.js.disabled      # Service worker (disabled)
│   ├── css/
│   │   └── main.css        # Main stylesheet with theme system
│   ├── js/
│   │   ├── main.js         # Main game logic with intelligent selection
│   │   ├── api.js          # API communication
│   │   ├── init.js         # Initialization logic
│   │   ├── storage.js      # Storage management
│   │   └── simple-storage.js # Simplified storage
│   └── test-hint.html      # Hint testing page
├── backend/                 # Python backend (minimal)
│   ├── app.py              # Main Flask application
│   ├── config/
│   │   └── settings.py     # Application configuration
│   └── api/, models/, utils/ # Backend structure (minimal)
├── _resources/             # Development resources
├── static/                 # Static files
├── DEV-GUIDELINES.md       # Development guidelines
├── QUICK-REF.md           # Quick reference
├── requirements.txt        # Python dependencies
├── .gitignore             # Git ignore rules
└── README.md              # This file
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

4. **Run the development server:**

   ```bash
   cd frontend
   python dev-server.py
   ```

5. **Open your browser and navigate to:**

   ```text
   http://localhost:8080
   ```

## ✨ Features

- **Intelligent Problem Selection**: Error-aware balanced combination selection using tries-errors success scoring
- **Adaptive Learning**: Bidirectional error tracking that adapts to user performance
- **Theme System**: Light, dark, and auto (system) theme switching
- **Auto-Test Mode**: Rapid iteration testing with 10% error rate for algorithm validation
- **Level-Based Learning**: Multiple difficulty levels with different learning objectives
- **DEV-GUIDELINES Compliant**: Follows strict development guidelines for maintainable code
- **Layout Stability**: Fixed-height containers preventing screen jumping
- **Integrated Settings**: Welcome screen settings with auto-save functionality

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
