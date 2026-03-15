"use client";

type WebAuthnJSON = Record<string, any>;

function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function assertPasskeySupport() {
  if (typeof window === "undefined" || typeof window.PublicKeyCredential === "undefined" || !navigator.credentials) {
    throw new Error("이 기기에서는 패스키(WebAuthn)를 사용할 수 없습니다");
  }
}

function mapCredentialDescriptors(descriptors: any[] | undefined): PublicKeyCredentialDescriptor[] | undefined {
  if (!descriptors || descriptors.length === 0) return undefined;
  return descriptors.map((descriptor) => ({
    ...descriptor,
    id: base64UrlToArrayBuffer(descriptor.id),
  }));
}

function toCreationOptions(publicKey: WebAuthnJSON): PublicKeyCredentialCreationOptions {
  return {
    ...publicKey,
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64UrlToArrayBuffer(publicKey.user.id),
    },
    excludeCredentials: mapCredentialDescriptors(publicKey.excludeCredentials),
  } as PublicKeyCredentialCreationOptions;
}

function toRequestOptions(publicKey: WebAuthnJSON): PublicKeyCredentialRequestOptions {
  return {
    ...publicKey,
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    allowCredentials: mapCredentialDescriptors(publicKey.allowCredentials),
  } as PublicKeyCredentialRequestOptions;
}

export async function createPasskeyCredential(publicKey: WebAuthnJSON): Promise<WebAuthnJSON> {
  assertPasskeySupport();

  const credential = await navigator.credentials.create({
    publicKey: toCreationOptions(publicKey),
  });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("패스키 생성에 실패했습니다");
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: arrayBufferToBase64Url(response.attestationObject),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      transports: typeof (response as any).getTransports === "function" ? (response as any).getTransports() : [],
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

export async function getPasskeyAssertion(publicKey: WebAuthnJSON): Promise<WebAuthnJSON> {
  assertPasskeySupport();

  const credential = await navigator.credentials.get({
    publicKey: toRequestOptions(publicKey),
  });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("패스키 인증에 실패했습니다");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      signature: arrayBufferToBase64Url(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}
