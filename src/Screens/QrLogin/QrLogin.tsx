import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { mstorage } from '../../../utils/mmkvStorage';
import Images from '../../../images/images';
import { getSizeConfig } from '../../../utils/screenConfig';

const API_BASE_URL = 'https://dev-api.penpencil.co/clicker-backend/v1';
const POLLING_INTERVAL = 2000;

interface SessionData {
    sessionId: string;
    qrPayload: string;
    expiresAt: string;
}

interface Teacher {
    _id: string;
    teacherId: string;
    name: string;
    schoolId: string;
    class: string;
    subject: string;
    allClasses: string[];
    allSubjects: string[];
    isClassTeacher: boolean;
}

interface AuthResponse {
    status: string;
    authToken?: string;
    teacher?: Teacher;
}

type StatusType = 'generating' | 'waiting' | 'authorized' | 'error';

const QrLogin: React.FC = () => {
    const screenSizes = getSizeConfig();
    const [qrPayload, setQrPayload] = useState<string | null>(null);
    const [resultPayload, setResultPayload] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<StatusType>('generating');
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        initializeSession();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const initializeSession = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/device-auth/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to generate session');
            }

            const result = await response.json();
            const data: SessionData = result.data;

            setSessionId(data.sessionId);
            setQrPayload(data.qrPayload);
            setStatus('waiting');
            setLoading(false);

            startPolling(data.sessionId);

            const expiryTime = new Date(data.expiresAt).getTime() - Date.now();
            setTimeout(() => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    setStatus('error');
                    setError('QR code expired. Please refresh.');
                }
            }, expiryTime);

            if (result) {
                setResultPayload(JSON.stringify(result))
            }

        } catch (err) {
            setLoading(false);
            setStatus('error');
            setError((err as Error).message || 'Failed to initialize session');
        }
    };

    const startPolling = (sessionId: string): void => {
        // console.log(sessionId, "sessionId")

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/device-auth/session/${sessionId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Polling failed');
                }

                const result = await response.json();
                const data: AuthResponse = result.data;

                if (data.status === 'authorized' && data.authToken && data.teacher) {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                    }
                    setStatus('authorized');
                    handleSuccessfulLogin(data.authToken, data.teacher);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, POLLING_INTERVAL);
    };

    const handleSuccessfulLogin = (authToken: string, teacher: Teacher): void => {
        // console.log('Auth Token:', authToken);
        // console.log('Teacher Data:', teacher);
        mstorage.set("selectedClass", teacher.class);
        mstorage.set("teacher", teacher.name)
        Alert.alert(
            'Login Successful',
            `Welcome ${teacher.name}!\nClass: ${teacher.class}\nSubject: ${teacher.subject}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate to home screen or save data
                        navigation.reset({
                            index: 0,
                            // @ts-expect-error
                            routes: [{ name: "Home" }],
                        });
                    },
                },
            ]
        );
    };
    // console.log(qrPayload, "qrPayload")
    const renderContent = () => {
        if (loading || status === 'generating') {
            return (
                <ImageBackground
                    source={Images.loginBackground}
                    style={{ flex: 1 }}
                    resizeMode="stretch"
                >
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.statusText}>Generating QR Code...</Text>
                    </View>
                </ImageBackground>
            );
        }

        if (status === 'error' || error) {
            return (
                <ImageBackground
                    source={Images.loginBackground}
                    style={{ flex: 1 }}
                    resizeMode="stretch"
                >
                    <View style={styles.centerContent}>
                        <Text style={styles.errorText}>❌ {error}</Text>
                        <TouchableOpacity onPress={initializeSession}>
                            <Text style={styles.retryText}>Tap to retry</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            );
        }

        if (status === 'waiting' && qrPayload) {
            return (
                <ImageBackground
                    source={Images.loginBackground}
                    style={{ flex: 1 }}
                    resizeMode="stretch"
                >
                    <View style={styles.centerContent}>
                        <Text style={styles.title}>Scan to Login</Text>
                        {/* <Text style={styles.subtitle}>
              Scan this QR code with your mobile app to login
            </Text> */}

                        <View style={styles.qrContainer}>
                            {resultPayload &&
                                <QRCode
                                    value={resultPayload}
                                    size={120 * screenSizes.widthScale}
                                    backgroundColor="white"
                                    color="black"
                                />
                            }
                        </View>

                        <View style={styles.statusContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.waitingText}>Waiting for authorization...</Text>
                        </View>

                        <Text style={styles.sessionInfo}>
                            Session ID: {sessionId?.slice(0, 8)}...
                        </Text>
                    </View>
                </ImageBackground>

            );
        }

        if (status === 'authorized') {
            return (
                <ImageBackground
                    source={Images.loginBackground}
                    style={{ flex: 1 }}
                    resizeMode="stretch"
                >
                    <View style={styles.centerContent}>
                        <Text style={styles.successIcon}>✅</Text>
                        <Text style={styles.successText}>Login Successful!</Text>
                        <Text style={styles.subtitle}>Redirecting...</Text>
                    </View>
                </ImageBackground>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
};

const useResponsiveStyles = () => {
    const screenSizes = getSizeConfig();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
            // justifyContent: 'center',
            // alignItems: 'center',
            // padding: 20,
        },
        centerContent: {
            position: "absolute",

            width: "35%",
            height: "50%",
            padding: 20 * screenSizes.paddingScale,
            backgroundColor: "white",

            // Vertical center
            top: "32%",
            transform: [{ translateY: -50 }],

            // 25% away from right side
            right: "7%",

            // Center content inside box
            alignItems: "center",
            justifyContent: "center",
        },

        title: {
            fontSize: 28 * screenSizes.fontScale,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 10 * screenSizes.marginScale,
        },
        subtitle: {
            fontSize: 16 * screenSizes.fontScale,
            color: '#666',
            textAlign: 'center',
            marginBottom: 30 * screenSizes.marginScale,
            paddingHorizontal: 20 * screenSizes.paddingScale,
        },
        qrContainer: {
            backgroundColor: 'white',
            padding: 20 * screenSizes.paddingScale,
            borderRadius: 16 * screenSizes.borderRadiusScale,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            marginBottom: 30 * screenSizes.marginScale,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 0,
        },
        statusText: {
            fontSize: 16 * screenSizes.fontScale,
            color: '#666',
            marginTop: 20 * screenSizes.marginScale,
        },
        waitingText: {
            fontSize: 16 * screenSizes.fontScale,
            color: '#666',
            marginLeft: 10 * screenSizes.marginScale,
        },
        sessionInfo: {
            fontSize: 12 * screenSizes.fontScale,
            color: '#999',
            marginTop: 10 * screenSizes.marginScale,
        },
        errorText: {
            fontSize: 18 * screenSizes.fontScale,
            color: '#FF3B30',
            textAlign: 'center',
            marginBottom: 20 * screenSizes.marginScale,
        },
        retryText: {
            fontSize: 16 * screenSizes.fontScale,
            color: '#007AFF',
            textDecorationLine: 'underline',
        },
        successIcon: {
            fontSize: 64 * screenSizes.fontScale,
            marginBottom: 20 * screenSizes.marginScale,
        },
        successText: {
            fontSize: 24 * screenSizes.fontScale,
            fontWeight: 'bold',
            color: '#34C759',
            marginBottom: 10 * screenSizes.marginScale,
        },
    });
};

const styles = useResponsiveStyles();


export default QrLogin;