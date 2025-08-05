import { post } from "@/lib/axios";
import { authService } from "./auth.service";

// Digio Web SDK types
declare global {
  interface Window {
    Digio: any;
  }
}

// Digio API interfaces based on the documentation
export interface DigioSigner {
  identifier: string; // Email or mobile
  name: string;
  sign_type?: "aadhaar" | "dsc" | "electronic";
  signature_mode?: "otp" | "slate" | "kyc";
  reason?: string;
}

export interface DigioSignRequest {
  file_name: string;
  file_data: string; // Base64 encoded PDF
  signers: DigioSigner[];
  expire_in_days?: number;
  display_on_page?: "first" | "last" | "all" | "custom";
  notify_signers?: boolean;
  send_sign_link?: boolean;
  generate_access_token?: boolean;
  comment?: string;
  sign_coordinates?: {
    [signerEmail: string]: {
      [pageNumber: string]: Array<{
        llx: number;
        lly: number;
        urx: number;
        ury: number;
      }>;
    };
  };
}

export interface DigioSignResponse {
  id: string;
  agreement_status: "draft" | "requested" | "completed" | "expired" | "failed";
  file_name: string;
  created_at: string;
  signing_parties: Array<{
    name: string;
    identifier: string;
    status: "requested" | "signed" | "expired";
    signature_type: string;
  }>;
  authentication_url?: string;
}

export interface PaymentAgreementData {
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  amount: number;
  subscriptionType: "monthly" | "quarterly" | "yearly";
  portfolioNames: string[];
  agreementDate: string;
}

export const digioService = {
  // Load Digio SDK
  loadDigioSDK: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Digio) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://ext.digio.in/sdk/v15/digio.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  },

  // Generate payment agreement PDF content
  generatePaymentAgreementPDF: (data: PaymentAgreementData): string => {
    const agreementContent = `
      PAYMENT AGREEMENT
      
      Customer: ${data.customerName}
      Email: ${data.customerEmail}
      ${data.customerMobile ? `Mobile: ${data.customerMobile}` : ''}
      
      Agreement Date: ${data.agreementDate}
      
      SUBSCRIPTION DETAILS:
      - Type: ${data.subscriptionType.toUpperCase()}
      - Amount: Rs.${data.amount.toLocaleString('en-IN')}
      - Portfolios: ${data.portfolioNames.join(', ')}
      
      By signing this agreement, the customer agrees to the subscription terms
      and authorizes the payment for the selected portfolio services.
      
      Signature: ___________________
      Date: ${data.agreementDate}
    `;
    
    return btoa(unescape(encodeURIComponent(agreementContent)));
  },

  // Create sign request with mock implementation for development
  createPaymentSignRequest: async (
    agreementData: PaymentAgreementData
  ): Promise<{ documentId: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_DIGIO_API_KEY;
    if (!apiKey || apiKey === 'your-digio-api-key') {
      console.warn('Digio API key not configured, using mock response');
      const mockDocumentId = `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { documentId: mockDocumentId };
    }

    // For production, use the backend API route to avoid CORS
    try {
      const response = await fetch('/api/digio/create-sign-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agreementData,
          signRequest: {
            file_name: `Payment_Agreement_${Date.now()}.pdf`,
            signers: [{
              identifier: agreementData.customerEmail,
              name: agreementData.customerName,
              sign_type: "aadhaar",
              signature_mode: "otp",
              reason: "Payment authorization for subscription services"
            }],
            expire_in_days: 7,
            display_on_page: "last",
            notify_signers: false,
            send_sign_link: false,
            generate_access_token: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sign request');
      }

      const data = await response.json();
      return { documentId: data.documentId };
    } catch (error) {
      console.error('Error creating sign request:', error);
      // Fallback to mock for development
      const mockDocumentId = `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { documentId: mockDocumentId };
    }
  },

  // Initialize Digio SDK and handle signing
  initializeDigioSigning: async (
    documentId: string,
    customerEmail: string,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): Promise<void> => {
    const apiKey = process.env.NEXT_PUBLIC_DIGIO_API_KEY;
    if (!apiKey || apiKey === 'your-digio-api-key') {
      digioService.showDemoESignInterface(documentId, customerEmail, onSuccess, onError);
      return;
    }

    const isLoaded = await digioService.loadDigioSDK();
    
    if (!isLoaded) {
      onError(new Error("Failed to load Digio SDK"));
      return;
    }

    const options = {
      environment: "sandbox", // Use sandbox for development
      callback: function(response: any) {
        if (response.hasOwnProperty("error_code")) {
          console.error("Digio signing error:", response);
          onError(new Error(response.message || "Signing failed"));
          return;
        }
        console.log("Signing completed successfully:", response);
        onSuccess(response);
      },
      logo: "/logo.png",
      theme: {
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af"
      },
      is_iframe: true,
      // Prevent autofocus issues
      iframe_config: {
        allow: "camera; microphone; geolocation",
        sandbox: "allow-scripts allow-same-origin allow-forms allow-popups"
      }
    };

    try {
      const digio = new window.Digio(options);
      digio.init();
      digio.submit(documentId, customerEmail);
    } catch (error) {
      console.error("Error initializing Digio:", error);
      onError(error);
    }
  },

  showDemoESignInterface: (
    documentId: string,
    customerEmail: string,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ) => {
    const popup = window.open('', 'digio-demo', 'width=500,height=600');
    if (!popup) {
      onError(new Error('Popup blocked'));
      return;
    }

    popup.document.write(`<!DOCTYPE html><html><head><title>Aadhaar eSign</title><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.container{background:white;padding:30px;border-radius:10px}.header{text-align:center;margin-bottom:30px}.logo{width:60px;height:60px;background:#2563eb;border-radius:50%;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:5px;font-weight:bold}input{width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;box-sizing:border-box}button{width:100%;padding:12px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer}.step{margin-bottom:15px;padding:10px;background:#f8f9fa;border-left:4px solid #2563eb}</style></head><body><div class="container"><div class="header"><div class="logo">🔐</div><h2>Aadhaar eSign</h2><p>Demo - ${documentId}</p></div><div id="step1"><div class="step"><strong>Step 1:</strong> Enter Aadhaar</div><div class="form-group"><label>Aadhaar:</label><input type="text" id="aadhaar" placeholder="XXXX-XXXX-XXXX" maxlength="14"></div><button onclick="sendOTP()">Send OTP</button></div><div id="step2" style="display:none"><div class="step"><strong>Step 2:</strong> Enter OTP</div><div class="form-group"><label>OTP:</label><input type="text" id="otp" placeholder="6-digit OTP" maxlength="6"></div><button onclick="verifyOTP()">Verify & Sign</button></div><div id="step3" style="display:none"><div class="step"><strong>Step 3:</strong> Signed!</div><button onclick="closeAndComplete()">Complete</button></div></div><script>function sendOTP(){const a=document.getElementById('aadhaar').value;if(a.length<12){alert('Enter valid Aadhaar');return}document.getElementById('step1').style.display='none';document.getElementById('step2').style.display='block'}function verifyOTP(){const o=document.getElementById('otp').value;if(o.length!==6){alert('Enter valid OTP');return}document.getElementById('step2').style.display='none';document.getElementById('step3').style.display='block'}function closeAndComplete(){window.opener.postMessage({type:'digio-success',data:{document_id:'${documentId}',status:'completed',message:'Signed (demo)'}},'*');window.close()}</script></body></html>`);

    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'digio-success') {
        window.removeEventListener('message', messageHandler);
        onSuccess(event.data.data);
      }
    };
    window.addEventListener('message', messageHandler);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);
  },

  validateSignatureForPayment: async (documentId: string): Promise<boolean> => {
    const token = authService.getAccessToken();
    
    try {
      const response = await post<DigioSignResponse>(
        "/api/digio/check-status",
        { documentId },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.agreement_status === "completed";
    } catch (error) {
      console.error("Error validating signature:", error);
      return false;
    }
  }
};