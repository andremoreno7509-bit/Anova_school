export const defaultBranding={displayName:'A-NOVA School',shortName:'A-NOVA',logoUrl:null,primaryColor:'#3155E7',secondaryColor:'#0B1422',accentColor:'#8093FF',contactEmail:null,phone:null,website:null,address:null,city:null,state:null,country:'México',postalCode:null,timezone:'America/Mexico_City',locale:'es-MX',reportFooter:'Documento generado por A-NOVA School.',showPoweredBy:true};

export const csbBranding={
  displayName:'Colegio Simón Bolívar del Pedregal',
  shortName:'CSB Pedregal',
  logoUrl:'/csb-logo.jpg',
  primaryColor:'#670337',
  secondaryColor:'#02244A',
  accentColor:'#D4AD22',
  contactEmail:null,
  phone:null,
  website:'https://csbpedregal.edu.mx/',
  address:null,
  city:'Ciudad de México',
  state:'Ciudad de México',
  country:'México',
  postalCode:null,
  timezone:'America/Mexico_City',
  locale:'es-MX',
  reportFooter:'Colegio Simón Bolívar del Pedregal · Portal Académico CSB · Powered by A-NOVA.',
  showPoweredBy:true
};

function usesLegacyDemoBrand(school,settings){
  if(school?.code!=='ANOVA-DEMO')return false;
  if(!settings)return true;
  const display=(settings.displayName||'').trim();
  const short=(settings.shortName||'').trim();
  return !display||['A-NOVA School Demo','A-NOVA School','A-NOVA'].includes(display)||['A-NOVA','A-NOVA School'].includes(short);
}

export function normalizeBranding(school,settings){
  const s=settings||{};
  const preset=usesLegacyDemoBrand(school,settings)?csbBranding:defaultBranding;
  const legacy=usesLegacyDemoBrand(school,settings);
  return {
    ...preset,
    displayName:legacy?preset.displayName:(s.displayName||school?.name||preset.displayName),
    shortName:legacy?preset.shortName:(s.shortName||school?.name?.slice(0,24)||preset.shortName),
    logoUrl:legacy?preset.logoUrl:(s.logoUrl||preset.logoUrl),
    primaryColor:legacy?preset.primaryColor:(s.primaryColor||preset.primaryColor),
    secondaryColor:legacy?preset.secondaryColor:(s.secondaryColor||preset.secondaryColor),
    accentColor:legacy?preset.accentColor:(s.accentColor||preset.accentColor),
    contactEmail:s.contactEmail||preset.contactEmail,
    phone:s.phone||preset.phone,
    website:s.website||preset.website,
    address:s.address||preset.address,
    city:s.city||preset.city,
    state:s.state||preset.state,
    country:s.country||preset.country,
    postalCode:s.postalCode||preset.postalCode,
    timezone:s.timezone||preset.timezone,
    locale:s.locale||preset.locale,
    reportFooter:s.reportFooter||preset.reportFooter,
    showPoweredBy:s.showPoweredBy!==false,
    schoolCode:school?.code||null
  }
}
