package com.skillbridge.ai.coding;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class CodingController {
    private final CodingProblemRepository problems;
    private final CodingSubmissionRepository submissions;
    private final CodingDraftRepository drafts;
    private final UserRepository users;
    private final String judgeUrl;

    public CodingController(CodingProblemRepository problems,CodingSubmissionRepository submissions,
                            CodingDraftRepository drafts,UserRepository users,
                            @Value("${JUDGE0_URL:}") String judgeUrl){
        this.problems=problems;this.submissions=submissions;this.drafts=drafts;this.users=users;this.judgeUrl=judgeUrl;
    }

    @GetMapping("/problems")
    public Page<CodingDtos.ProblemResponse> list(Pageable pageable){return problems.findAll(pageable).map(this::problem);}
    @GetMapping("/problems/{id}")
    public CodingDtos.ProblemResponse get(@PathVariable Long id){
        return problem(problems.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Problem not found")));
    }
    @GetMapping("/problems/daily")
    public CodingDtos.ProblemResponse daily(){return problems.findAll(Pageable.ofSize(1)).stream().findFirst().map(this::problem).orElseThrow(()->new ApiException(404,"NOT_FOUND","No coding problems configured")); }

    @PutMapping("/problems/{id}/draft")
    @Transactional
    public Map<String,Object> draft(@PathVariable Long id,@RequestBody CodingDtos.SubmissionRequest request,Authentication authentication){
        CodingProblem problem=problems.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Problem not found"));
        User student=currentUser(authentication);CodingDraft draft=drafts.findByStudentIdAndProblemId(student.getId(),id).orElseGet(CodingDraft::new);
        draft.setStudent(student);draft.setProblem(problem);draft.setLanguage(request.language());draft.setCode(request.code());drafts.save(draft);
        return Map.of("saved",true);
    }

    @PostMapping("/problems/{id}/run")
    public Map<String,Object> run(@PathVariable Long id,@RequestBody @Valid CodingDtos.SubmissionRequest request){
        problems.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Problem not found"));
        if(judgeUrl==null||judgeUrl.isBlank()) throw new ApiException(503,"JUDGE_UNAVAILABLE","Sandboxed code execution is not configured");
        throw new ApiException(503,"JUDGE_UNAVAILABLE","Sandboxed code execution is not configured");
    }

    @PostMapping("/problems/{id}/submit")
    @Transactional
    public CodingDtos.SubmissionResponse submit(@PathVariable Long id,@RequestBody @Valid CodingDtos.SubmissionRequest request,Authentication authentication){
        CodingProblem problem=problems.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Problem not found"));
        if(judgeUrl==null||judgeUrl.isBlank()) throw new ApiException(503,"JUDGE_UNAVAILABLE","No submission verdict can be issued until a sandboxed judge is configured");
        throw new ApiException(503,"JUDGE_UNAVAILABLE","No submission verdict can be issued until a sandboxed judge is configured");
    }

    @GetMapping("/submissions/me")
    public List<CodingDtos.SubmissionResponse> mine(Authentication authentication){
        return submissions.findByStudentIdOrderBySubmittedAtDesc(currentUser(authentication).getId()).stream().map(this::submission).toList();
    }
    @GetMapping("/submissions/{id}")
    public CodingDtos.SubmissionResponse submission(@PathVariable Long id,Authentication authentication){
        CodingSubmission s=submissions.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Submission not found"));
        if(!s.getStudent().getId().equals(currentUser(authentication).getId())) throw new ApiException(403,"FORBIDDEN","Submission not owned");
        return submission(s);
    }
    @GetMapping("/problems/{id}/attempts")
    public List<CodingDtos.SubmissionResponse> attempts(@PathVariable Long id,Authentication authentication){
        return submissions.findByStudentIdAndProblemIdOrderBySubmittedAtDesc(currentUser(authentication).getId(),id).stream().map(this::submission).toList();
    }

    @GetMapping("/problems/{id}/hints/{level}")
    public CodingDtos.HintResponse hint(@PathVariable Long id,@PathVariable int level){
        int safe=Math.max(1,Math.min(level,4));
        String hint=switch(safe){case 1->"Identify the repeated operation and the data structure that supports it efficiently.";case 2->"Consider one pass with an auxiliary lookup structure.";case 3->"Maintain a key-to-index lookup while scanning; check the complement before insertion.";default->"Review edge cases such as duplicates and missing complements; this guidance intentionally stops short of a complete solution.";};
        return new CodingDtos.HintResponse(safe,hint);
    }

    private CodingDtos.ProblemResponse problem(CodingProblem p){return new CodingDtos.ProblemResponse(p.getId(),p.getTitle(),p.getDifficulty(),p.getTopic(),p.getStatement(),p.getStarterCode(),p.getSampleInput(),p.getSampleOutput(),p.getConstraints());}
    private CodingDtos.SubmissionResponse submission(CodingSubmission s){return new CodingDtos.SubmissionResponse(s.getId(),s.getProblem().getId(),s.getVerdict(),s.getScorePercent(),s.getFeedback(),s.getSubmittedAt()==null?null:s.getSubmittedAt().toString());}
    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found")); }
}
