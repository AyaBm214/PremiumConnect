export type PropertyType = 'apartment' | 'house' | 'villa' | 'cottage';

export interface Property {
    id: string;
    ownerId: string;
    name: string;
    address?: string;
    status: 'draft' | 'pending_review' | 'active';
    currentStep: number;
    totalSteps: number;
    progress: number; // 0 to 100
    updatedAt: string;

    // Data from steps
    data: {
        // Step 1: Info
        info?: {
            propertyName?: string;
            description?: string;
            floorNumber?: string;
            address?: string;
            size?: string;
            sizeUnit?: string;
            numRooms?: number;
            numBathrooms?: number;
            type?: PropertyType;
            citqFile?: string;
            reservationsFile?: string;
            checkInTime?: string;
            checkOutTime?: string;
            comments?: string;
        };
        // Step 2: Amenities
        amenities?: string[];
        poolOpeningDate?: string; // If pool is selected
        hotTubOpeningDate?: string; // If hot tub is selected
        bbqOpeningDate?: string; // If BBQ is selected
        amenitiesComments?: string;
        // Step 3: Photos (mocked urls)
        photos?: string[];
        externalLinks?: string[];
        googleDriveLink?: string;
        photosComments?: string;
        // Step 4: Access
        access?: {
            instructions?: string;
            videoUrl?: string; // or file path
            comments?: string;
        };
        // Step 5: Rules & Fees
        rules?: {
            smoking?: boolean;
            pets?: boolean;
            events?: boolean;
            quietHours?: string;
            providesCleaning?: boolean;
            cleaningFee?: number;
            maxGuests?: number;
            maxPets?: number;

            // New fields
            doorCode?: string;
            lockType?: ('smart_lock' | 'lockbox')[];
            alarmCode?: string;
            hasCameras?: boolean;
            numCameras?: number;
            cameraPlacements?: string;

            cleaningContact?: string;
            snowRemovalContact?: string;
            additionalNotes?: string;

            comments?: string;
        };
        // Step 6: Guide
        guide?: {
            wifiDetails?: string;
            wifiRouterPhoto?: string;
            wifiSpeedTestScreenshot?: string;
            tourVideo?: string;
            firstAidKitPhoto?: string;
            lockVideoUrl?: string; // How to unlock
            lockPhoto?: string; // Key box/lock
            kitchenPhotos?: string[];
            acVideoUrl?: string;
            extrasPhotos?: string[]; // Sheets, baby, games
            luggageList?: string; // Host essentials for guest
            emergencyContacts?: string;
            comments?: string;
        };
        // Step 7: Payment
        payment?: {
            bankName?: string;
            accountNumber?: string;
            routingNumber?: string;
            accountHolder?: string;
            transitInstitution?: string;
            branchNumber?: string;
            comments?: string;
        };
        // Step 7: Contract
        contract?: {
            status: 'approved' | 'changes_requested';
            comments?: string;
            reviewedAt?: string;
        };
    };
}

export interface UserProfile {
    id: string; // matches auth.users.id
    full_name: string;
    email: string;
    phone_number: string;
    documents: {
        identity_proof: string; // URL
        void_cheque: string; // URL
        insurance_proof: string; // URL
        citq_certificate: string; // URL
        tax_confirmation: boolean;
    };
    created_at: string;
}

export const TOTAL_ONBOARDING_STEPS = 7;
