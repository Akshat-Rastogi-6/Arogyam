# Arogyam - Personalized Health Care Platform

Welcome to Arogyam, a comprehensive health care platform that combines intelligent chatbot technology with advanced disease prediction models. This platform is designed to provide personalized health care solutions, early disease detection, and health management tools to help users maintain optimal health and well-being.

![image](https://github.com/user-attachments/assets/4bfc38c6-1665-458c-986b-f86f43dfed22)

## Project Overview

Arogyam is a full-stack web application built with React.js frontend and Flask Python backend, featuring machine learning models for disease prediction and an intelligent chatbot for health consultations. The platform aims to make healthcare more accessible and provide early warning systems for various health conditions.

## Technology Stack

### Frontend

- **React.js** - Modern web framework for user interface
- **React Router** - Client-side routing
- **CSS3** - Styling and responsive design
- **Lottie Animations** - Interactive animations

### Backend

- **Flask** - Python web framework
- **pandas** - Data manipulation and analysis
- **joblib** - Model serialization
- **scikit-learn** - Machine learning models
- **Flask-CORS** - Cross-origin resource sharing

### Machine Learning

- **Diabetes Prediction Model** - Trained ML model for diabetes risk assessment
- **Future Models** - Hypertension, Parkinson's, and other disease prediction models

## Features

### Core Features

- **Intelligent Chatbot (Rantbot)**: Advanced AI chatbot for health consultations and personalized recommendations
- **Disease Prediction**: Machine learning-powered prediction models for early disease detection
- **User Profile Management**: Comprehensive patient summary and health history tracking
- **Weather-Based Health Tips**: Seasonal health recommendations based on current weather conditions
- **Natural Therapy Guide**: Evidence-based natural remedies and therapeutic approaches
- **Dashboard Analytics**: Centralized health monitoring and insights
  ![image](https://github.com/user-attachments/assets/fdf15378-841d-472f-aad2-80a0489033f4)


### Disease Prediction Models

- **Diabetes Prediction**: Risk assessment based on 8 key health parameters
- **Hypertension Prediction** (Coming Soon): Blood pressure risk evaluation
- **Parkinson's Disease Prediction** (Coming Soon): Early detection screening
- **Additional Models** (Planned): Heart disease, kidney disease, and more

## Pages and Functionality

### 1. Dashboard

![image](https://github.com/user-attachments/assets/eb56d05f-ca34-4798-866a-1d21934b5a39)


The main dashboard provides a comprehensive overview of all platform features with intuitive navigation cards:

- Patient summary access
- Real-time notifications
- Quick chatbot access
- Disease prediction center
- Natural therapy resources
- Seasonal health tips with weather integration

### 2. Disease Prediction Hub

Central hub for accessing various disease prediction models:

- Multiple prediction options (Diabetes, Hypertension, Parkinson's)
- Easy navigation to specific prediction forms
- Model accuracy information
- Risk assessment guidelines

### 3. Diabetes Prediction Page

Comprehensive diabetes risk assessment form featuring:

- 8 input parameters (Pregnancies, Glucose, Blood Pressure, etc.)
- Real-time validation
- Instant prediction results
- Risk level interpretation
- Recommendations based on results

### 4. Chatbot Interface (Rantbot)

![image](https://github.com/user-attachments/assets/ffc79941-1030-4e2e-a957-681177e197f8)


Intelligent health consultation system:

- Natural language processing
- Personalized health advice
- Medical query responses
- Symptom analysis
- Treatment recommendations

### 5. User Profile

![image](https://github.com/user-attachments/assets/5068065f-0896-40eb-9b77-3917153665c9)


Comprehensive patient information management:

- Personal health information
- Medical history tracking
- Health goals setting
- Progress monitoring
- Data visualization

### 6. Natural Therapy

![image](https://github.com/user-attachments/assets/52731fa6-52d7-4b91-b60e-201895a40dec)

Evidence-based natural health solutions:

- Herbal remedies database
  ![image](https://github.com/user-attachments/assets/2daf773e-65b9-4723-85df-21ab03e548bd)
- Therapeutic exercises
- Nutrition guidance
- Lifestyle recommendations
  ![image](https://github.com/user-attachments/assets/90300375-eb2c-484a-ad6a-51d576fcb862)
- Safety guidelines

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package installer)

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Backend Setup

```bash
cd chatbot-backend
pip install -r requirements.txt
python app.py
```

### Model Requirements

Ensure trained models are placed in the `chatbot-backend/models/` directory:

- `diabetes_model.pkl`
- Additional model files as they become available

## API Endpoints

### Disease Prediction

- **POST** `/predict` - Diabetes prediction endpoint
  - Input: JSON with health parameters
  - Output: Prediction result (0 or 1)

### Future Endpoints (Planned)

- **POST** `/predict/hypertension` - Hypertension prediction
- **POST** `/predict/parkinson` - Parkinson's disease prediction
- **GET** `/models/info` - Model information and accuracy metrics

## Project Structure

```
Arogyam/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiabetesPredictionPage.jsx
│   │   │   └── DiseasePredictionPage.jsx
│   │   ├── components/
│   │   └── public/
│   └── app.jsx
├── chatbot-backend/
│   ├── app.py
│   ├── models/
│   │   └── diabetes_model.pkl
│   └── requirements.txt
└── README.md
```


## Future Enhancements

- **Additional Disease Models**: Heart disease, kidney disease, liver disease prediction
- **Mobile Application**: React Native mobile app
- **Telemedicine Integration**: Video consultation capabilities
- **IoT Device Integration**: Wearable device data integration
- **Multi-language Support**: Localization for different regions
- **Advanced Analytics**: Predictive health insights and trends

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Email: shubhorai12@gmail.com

## Acknowledgments

- Medical professionals for domain expertise
- Open-source machine learning community
- Healthcare data providers
- Beta testers and early adopters

---

**Disclaimer**: This platform is for educational and informational purposes only. Always consult with qualified healthcare professionals for medical advice and treatment decisions.
