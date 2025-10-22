import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import type { InsertCV } from "@shared/schema";

interface Props {
  data: Partial<InsertCV>;
  updateData?: (section: string, data: any) => void;
  onNext?: () => void;
}

export default function CVPreview({ data }: Props) {
  const { personalInfo, workExperience, skills, education, aboutMe } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold" data-testid="text-step-title">Preview Your CV</h3>
        <Download className="text-muted-foreground" size={20} />
      </div>
      <p className="text-muted-foreground mb-6">
        Review your CV before saving. You can go back to edit any section.
      </p>

      <Card className="p-8 bg-white text-black max-h-[600px] overflow-y-auto" data-testid="card-cv-preview">
        <div className="space-y-8">
          {/* Personal Info */}
          {personalInfo && (
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold mb-4" data-testid="text-preview-name">
                {personalInfo.fullName}
              </h1>
              <div className="space-y-1 text-sm">
                {personalInfo.physicalAddress && (
                  <p>Physical Address: {personalInfo.physicalAddress}</p>
                )}
                <p>Contact Phone: {personalInfo.contactPhone}</p>
                <p>Contact Email: {personalInfo.contactEmail}</p>
              </div>
            </div>
          )}

          {/* Work Experience */}
          {workExperience && workExperience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">
                WORK EXPERIENCE
              </h2>
              {workExperience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div><span className="font-semibold">Period:</span> {exp.period}</div>
                    <div><span className="font-semibold">Company:</span> {exp.company}</div>
                    <div><span className="font-semibold">Position:</span> {exp.position}</div>
                    <div><span className="font-semibold">Type:</span> {exp.type}</div>
                    <div><span className="font-semibold">Industry:</span> {exp.industry}</div>
                    {exp.clientele && (
                      <div><span className="font-semibold">Clientele:</span> {exp.clientele}</div>
                    )}
                  </div>

                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">Responsibilities:</p>
                      {exp.responsibilities.map((resp, respIndex) => (
                        <div key={respIndex} className="mb-3 ml-4">
                          {resp.title && (
                            <p className="font-semibold text-sm mb-1">{resp.title}</p>
                          )}
                          <ul className="list-disc ml-6 text-sm space-y-1">
                            {resp.items.filter(item => item.trim()).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.references && exp.references.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">References:</p>
                      {exp.references.map((ref, refIndex) => (
                        <div key={refIndex} className="ml-6 text-sm">
                          <p>• {ref.name}</p>
                          <p className="ml-4">{ref.title}</p>
                          <p className="ml-4">{ref.phone}</p>
                          {ref.email && <p className="ml-4">{ref.email}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && (skills.softSkills || skills.technicalSkills || skills.languages) && (
            <div>
              <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">SKILLS</h2>
              
              {skills.softSkills && skills.softSkills.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Soft Skills:</h3>
                  {skills.softSkills.map((skill, index) => (
                    <div key={index} className="mb-3">
                      <p className="font-semibold text-sm">{skill.category}:</p>
                      <ul className="list-disc ml-6 text-sm">
                        {skill.items.filter(item => item.trim()).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {skills.technicalSkills && skills.technicalSkills.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Technical Skills:</h3>
                  {skills.technicalSkills.map((skill, index) => (
                    <div key={index} className="mb-3">
                      <p className="font-semibold text-sm">{skill.category}:</p>
                      <ul className="list-disc ml-6 text-sm">
                        {skill.items.filter(item => item.trim()).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {skills.languages && skills.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Languages:</h3>
                  <ul className="list-disc ml-6 text-sm">
                    {skills.languages.filter(lang => lang.trim()).map((lang, i) => (
                      <li key={i}>{lang}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">EDUCATION</h2>
              {education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">{edu.level}</h3>
                  <div className="ml-6 text-sm space-y-1">
                    {edu.details && <p>• {edu.details}</p>}
                    <p>{edu.period}</p>
                    <p>{edu.institution}</p>
                    <p>{edu.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Information */}
          {personalInfo && (personalInfo.legalName || personalInfo.age || personalInfo.gender || personalInfo.driversLicense) && (
            <div>
              <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">
                OTHER INFORMATION
              </h2>
              <div className="text-sm space-y-1">
                {personalInfo.legalName && (
                  <p><span className="font-semibold">Full Legal Name:</span> {personalInfo.legalName}</p>
                )}
                {personalInfo.age && personalInfo.gender && (
                  <p><span className="font-semibold">Age & Gender:</span> {personalInfo.age} & {personalInfo.gender}</p>
                )}
                {personalInfo.driversLicense && (
                  <p><span className="font-semibold">Drivers License Code:</span> {personalInfo.driversLicense}</p>
                )}
              </div>
            </div>
          )}

          {/* About Me */}
          {aboutMe && (
            <div>
              <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">ABOUT ME</h2>
              <p className="text-sm whitespace-pre-line">{aboutMe}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
